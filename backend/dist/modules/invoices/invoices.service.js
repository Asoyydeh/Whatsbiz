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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let InvoicesService = class InvoicesService {
    constructor(prisma, whatsappService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    generateInvoiceNumber() {
        const now = new Date();
        const y = now.getFullYear().toString().slice(-2);
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `INV-${y}${m}${d}-${rand}`;
    }
    async getInvoices(tenantId, page = 1, limit = 20, status, search) {
        const skip = (page - 1) * limit;
        const where = { tenant_id: tenantId };
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { invoice_number: { contains: search, mode: 'insensitive' } },
                { order: { customer: { name: { contains: search, mode: 'insensitive' } } } },
            ];
        }
        const [invoices, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                include: {
                    order: {
                        include: {
                            customer: { select: { id: true, name: true, phone: true } },
                            order_items: true,
                        },
                    },
                    payments: { orderBy: { created_at: 'desc' } },
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.invoice.count({ where }),
        ]);
        return { invoices, total, page, limit };
    }
    async getInvoiceById(tenantId, invoiceId) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id: invoiceId, tenant_id: tenantId },
            include: {
                order: {
                    include: {
                        customer: true,
                        order_items: true,
                    },
                },
                payments: true,
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice tidak ditemukan.');
        return invoice;
    }
    async createInvoice(tenantId, dto) {
        const order = await this.prisma.order.findFirst({
            where: { id: dto.order_id, tenant_id: tenantId },
        });
        if (!order)
            throw new common_1.NotFoundException('Pesanan tidak ditemukan.');
        return this.prisma.invoice.create({
            data: {
                tenant_id: tenantId,
                order_id: dto.order_id,
                invoice_number: this.generateInvoiceNumber(),
                status: 'DRAFT',
                total: order.total,
                paid_amount: 0,
                due_date: dto.due_date ? new Date(dto.due_date) : undefined,
            },
            include: {
                order: {
                    include: {
                        customer: { select: { id: true, name: true, phone: true } },
                        order_items: true,
                    },
                },
                payments: true,
            },
        });
    }
    async recordPayment(tenantId, invoiceId, dto) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id: invoiceId, tenant_id: tenantId },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice tidak ditemukan.');
        if (invoice.status === 'PAID') {
            throw new common_1.BadRequestException('Invoice ini sudah lunas.');
        }
        const newPaidAmount = invoice.paid_amount + dto.amount;
        if (newPaidAmount > invoice.total) {
            throw new common_1.BadRequestException(`Jumlah pembayaran melebihi total invoice (Rp ${invoice.total.toLocaleString('id-ID')}).`);
        }
        let newStatus;
        if (newPaidAmount >= invoice.total) {
            newStatus = 'PAID';
        }
        else if (newPaidAmount > 0) {
            newStatus = 'PARTIALLY_PAID';
        }
        else {
            newStatus = invoice.status;
        }
        const [payment, updatedInvoice] = await this.prisma.$transaction([
            this.prisma.payment.create({
                data: {
                    tenant_id: tenantId,
                    invoice_id: invoiceId,
                    method: dto.method,
                    amount: dto.amount,
                },
            }),
            this.prisma.invoice.update({
                where: { id: invoiceId },
                data: { paid_amount: newPaidAmount, status: newStatus },
                include: {
                    order: {
                        include: {
                            customer: { select: { id: true, name: true, phone: true } },
                            order_items: true,
                        },
                    },
                    payments: true,
                },
            }),
        ]);
        this.triggerPaymentReceivedAutomations(tenantId, updatedInvoice).catch((err) => {
            console.error('Error running PAYMENT_RECEIVED automations:', err);
        });
        return updatedInvoice;
    }
    async triggerPaymentReceivedAutomations(tenantId, invoice) {
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
            if (config.trigger === 'PAYMENT_RECEIVED') {
                const actions = config.actions || [];
                for (const action of actions) {
                    if (action.type === 'SEND_WHATSAPP') {
                        const template = action.config?.message || '';
                        const resolvedMessage = template
                            .replace(/\{\{\s*customer_name\s*\}\}/g, invoice.order?.customer?.name || '')
                            .replace(/\{\{\s*invoice_total\s*\}\}/g, new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(invoice.total))
                            .replace(/\{\{\s*invoice_number\s*\}\}/g, invoice.invoice_number);
                        const phone = invoice.order?.customer?.phone;
                        if (phone) {
                            await this.whatsappService.sendTextMessage(phone, resolvedMessage);
                        }
                    }
                }
            }
        }
    }
    async updateStatus(tenantId, invoiceId, dto) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id: invoiceId, tenant_id: tenantId },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice tidak ditemukan.');
        return this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: dto.status },
            include: {
                order: {
                    include: {
                        customer: { select: { id: true, name: true, phone: true } },
                        order_items: true,
                    },
                },
                payments: true,
            },
        });
    }
    async getInvoiceStats(tenantId) {
        const [total, byStatus, totalRevenue, overdueCount] = await Promise.all([
            this.prisma.invoice.count({ where: { tenant_id: tenantId } }),
            this.prisma.invoice.groupBy({
                by: ['status'],
                where: { tenant_id: tenantId },
                _count: { id: true },
                _sum: { total: true },
            }),
            this.prisma.invoice.aggregate({
                where: { tenant_id: tenantId, status: 'PAID' },
                _sum: { paid_amount: true },
            }),
            this.prisma.invoice.count({
                where: {
                    tenant_id: tenantId,
                    status: 'OVERDUE',
                },
            }),
        ]);
        const counts = byStatus.reduce((acc, row) => {
            acc[row.status] = { count: row._count.id, sum: row._sum.total || 0 };
            return acc;
        }, {});
        return {
            total,
            counts,
            totalPaid: totalRevenue._sum.paid_amount || 0,
            overdueCount,
        };
    }
    async getInvoiceForExport(tenantId, invoiceId) {
        const invoice = await this.getInvoiceById(tenantId, invoiceId);
        return invoice;
    }
    getWhatsappMessage(invoice) {
        const customer = invoice.order?.customer;
        const items = invoice.order?.order_items || [];
        const itemLines = items
            .map((i) => `  • ${i.name} x${i.quantity} = Rp ${(i.price * i.quantity).toLocaleString('id-ID')}`)
            .join('\n');
        return (`*Invoice #${invoice.invoice_number}*\n\n` +
            `Halo ${customer?.name || 'Pelanggan'},\n` +
            `Berikut tagihan Anda:\n\n` +
            `${itemLines}\n\n` +
            `*Total: Rp ${invoice.total.toLocaleString('id-ID')}*\n` +
            (invoice.due_date
                ? `Jatuh tempo: ${new Date(invoice.due_date).toLocaleDateString('id-ID')}\n`
                : '') +
            `\nTerima kasih telah berbelanja! 🙏`);
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map