"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = exports.KANBAN_COLUMNS = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const order_dto_1 = require("./dto/order.dto");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
exports.KANBAN_COLUMNS = [
    order_dto_1.OrderStatusEnum.DRAFT,
    order_dto_1.OrderStatusEnum.PENDING,
    order_dto_1.OrderStatusEnum.PROCESSING,
    order_dto_1.OrderStatusEnum.COMPLETED,
];
let OrdersService = class OrdersService {
    constructor(prisma, whatsappService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    generateOrderNumber() {
        const now = new Date();
        const y = now.getFullYear().toString().slice(-2);
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `ORD-${y}${m}${d}-${rand}`;
    }
    async getKanbanBoard(tenantId) {
        const orders = await this.prisma.order.findMany({
            where: {
                tenant_id: tenantId,
                status: { in: exports.KANBAN_COLUMNS },
            },
            include: {
                customer: {
                    select: { id: true, name: true, phone: true },
                },
                order_items: true,
                _count: { select: { invoices: true } },
            },
            orderBy: { updated_at: 'desc' },
        });
        const board = exports.KANBAN_COLUMNS.reduce((acc, status) => {
            acc[status] = orders.filter((o) => o.status === status);
            return acc;
        }, {});
        return board;
    }
    async getOrders(tenantId, page = 1, limit = 20, status) {
        const where = { tenant_id: tenantId };
        if (status)
            where.status = status;
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    customer: { select: { id: true, name: true, phone: true } },
                    order_items: true,
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);
        return { orders, total, page, limit };
    }
    async getOrderById(tenantId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenant_id: tenantId },
            include: {
                customer: true,
                order_items: true,
                invoices: {
                    include: { payments: true },
                },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Pesanan tidak ditemukan.');
        return order;
    }
    async createOrder(tenantId, userId, dto) {
        const subtotal = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discount = dto.discount || 0;
        const tax = dto.tax || 0;
        const total = subtotal - discount + tax;
        const order = await this.prisma.order.create({
            data: {
                tenant_id: tenantId,
                customer_id: dto.customer_id,
                order_number: this.generateOrderNumber(),
                status: 'DRAFT',
                subtotal,
                discount,
                tax,
                total,
                order_items: {
                    create: dto.items.map((item) => ({
                        tenant_id: tenantId,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                customer: { select: { id: true, name: true, phone: true } },
                order_items: true,
            },
        });
        await this.prisma.customer.update({
            where: { id: dto.customer_id },
            data: {
                total_orders: { increment: 1 },
                total_spent: { increment: total },
            },
        });
        this.triggerNewOrderAutomations(tenantId, order).catch((err) => {
            console.error('Error running NEW_ORDER automations:', err);
        });
        return order;
    }
    async triggerNewOrderAutomations(tenantId, order) {
        const automations = await this.prisma.automation.findMany({
            where: {
                tenant_id: tenantId,
                is_active: true,
            },
        });
        for (const auto of automations) {
            let config = {};
            try {
                config = JSON.parse(auto.trigger);
            }
            catch {
                continue;
            }
            if (config.trigger === 'NEW_ORDER') {
                const actions = config.actions || [];
                for (const action of actions) {
                    if (action.type === 'SEND_WHATSAPP') {
                        const template = action.config?.message || '';
                        const resolvedMessage = template
                            .replace(/\{\{\s*customer_name\s*\}\}/g, order.customer?.name || '')
                            .replace(/\{\{\s*order_total\s*\}\}/g, new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total))
                            .replace(/\{\{\s*order_number\s*\}\}/g, order.order_number);
                        if (order.customer?.phone) {
                            await this.whatsappService.sendTextMessage(order.customer.phone, resolvedMessage);
                        }
                    }
                }
            }
        }
    }
    async updateOrderStatus(tenantId, orderId, dto) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenant_id: tenantId },
        });
        if (!order)
            throw new common_1.NotFoundException('Pesanan tidak ditemukan.');
        return this.prisma.order.update({
            where: { id: orderId },
            data: { status: dto.status },
            include: {
                customer: { select: { id: true, name: true, phone: true } },
                order_items: true,
            },
        });
    }
    async updateOrder(tenantId, orderId, dto) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenant_id: tenantId },
        });
        if (!order)
            throw new common_1.NotFoundException('Pesanan tidak ditemukan.');
        const updateData = {};
        if (dto.items) {
            const subtotal = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const discount = dto.discount ?? order.discount;
            const tax = dto.tax ?? order.tax;
            updateData.subtotal = subtotal;
            updateData.discount = discount;
            updateData.tax = tax;
            updateData.total = subtotal - discount + tax;
            await this.prisma.orderItem.deleteMany({ where: { order_id: orderId } });
            updateData.order_items = {
                create: dto.items.map((item) => ({
                    tenant_id: tenantId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
            };
        }
        return this.prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                customer: { select: { id: true, name: true, phone: true } },
                order_items: true,
            },
        });
    }
    async deleteOrder(tenantId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenant_id: tenantId },
        });
        if (!order)
            throw new common_1.NotFoundException('Pesanan tidak ditemukan.');
        if (['COMPLETED', 'DELIVERED'].includes(order.status)) {
            throw new common_1.ForbiddenException('Pesanan yang sudah selesai tidak bisa dihapus.');
        }
        await this.prisma.orderItem.deleteMany({ where: { order_id: orderId } });
        await this.prisma.order.delete({ where: { id: orderId } });
        return { message: 'Pesanan berhasil dihapus.' };
    }
    async getOrderStats(tenantId) {
        const [total, byStatus, revenueResult] = await Promise.all([
            this.prisma.order.count({ where: { tenant_id: tenantId } }),
            this.prisma.order.groupBy({
                by: ['status'],
                where: { tenant_id: tenantId },
                _count: { id: true },
            }),
            this.prisma.order.aggregate({
                where: { tenant_id: tenantId, status: 'COMPLETED' },
                _sum: { total: true },
            }),
        ]);
        const counts = byStatus.reduce((acc, row) => {
            acc[row.status] = row._count.id;
            return acc;
        }, {});
        return {
            total,
            counts,
            totalRevenue: revenueResult._sum.total || 0,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map