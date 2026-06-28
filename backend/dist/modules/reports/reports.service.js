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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const date_fns_1 = require("date-fns");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(tenantId) {
        const now = new Date();
        const startOfThisMonth = (0, date_fns_1.startOfMonth)(now);
        const startOfLastMonth = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, 1));
        const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);
        const [totalRevenue, totalOrders, totalCustomers, activeConversations, revenueThisMonth, revenueLastMonth, ordersThisMonth, ordersLastMonth, customersThisMonth, customersLastMonth,] = await Promise.all([
            this.prisma.invoice.aggregate({
                where: { tenant_id: tenantId, status: 'PAID' },
                _sum: { paid_amount: true },
            }),
            this.prisma.order.count({ where: { tenant_id: tenantId } }),
            this.prisma.customer.count({ where: { tenant_id: tenantId, deleted_at: null } }),
            this.prisma.conversation.count({ where: { tenant_id: tenantId, status: 'OPEN' } }),
            this.prisma.invoice.aggregate({
                where: { tenant_id: tenantId, status: 'PAID', created_at: { gte: startOfThisMonth } },
                _sum: { paid_amount: true },
            }),
            this.prisma.invoice.aggregate({
                where: { tenant_id: tenantId, status: 'PAID', created_at: { gte: startOfLastMonth, lte: endOfLastMonth } },
                _sum: { paid_amount: true },
            }),
            this.prisma.order.count({ where: { tenant_id: tenantId, created_at: { gte: startOfThisMonth } } }),
            this.prisma.order.count({ where: { tenant_id: tenantId, created_at: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
            this.prisma.customer.count({ where: { tenant_id: tenantId, created_at: { gte: startOfThisMonth } } }),
            this.prisma.customer.count({ where: { tenant_id: tenantId, created_at: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
        ]);
        const calcGrowth = (current, previous) => previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
        return {
            totalRevenue: totalRevenue._sum.paid_amount || 0,
            totalOrders,
            totalCustomers,
            activeConversations,
            growth: {
                revenue: calcGrowth(revenueThisMonth._sum.paid_amount || 0, revenueLastMonth._sum.paid_amount || 0),
                orders: calcGrowth(ordersThisMonth, ordersLastMonth),
                customers: calcGrowth(customersThisMonth, customersLastMonth),
            },
        };
    }
    async getRevenueTrend(tenantId, days = 30) {
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const day = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(new Date(), i));
            const nextDay = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(new Date(), i - 1));
            const [revenue, orders] = await Promise.all([
                this.prisma.invoice.aggregate({
                    where: {
                        tenant_id: tenantId,
                        status: 'PAID',
                        created_at: { gte: day, lt: nextDay },
                    },
                    _sum: { paid_amount: true },
                }),
                this.prisma.order.count({
                    where: {
                        tenant_id: tenantId,
                        created_at: { gte: day, lt: nextDay },
                    },
                }),
            ]);
            result.push({
                date: (0, date_fns_1.format)(day, 'dd MMM'),
                revenue: revenue._sum.paid_amount || 0,
                orders,
            });
        }
        return result;
    }
    async getOrderStats(tenantId) {
        const byStatus = await this.prisma.order.groupBy({
            by: ['status'],
            where: { tenant_id: tenantId },
            _count: { id: true },
            _sum: { total: true },
        });
        return byStatus.map((row) => ({
            status: row.status,
            count: row._count.id,
            total: row._sum.total || 0,
        }));
    }
    async getCustomerStats(tenantId) {
        const result = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(new Date(), i));
            const monthEnd = i === 0 ? new Date() : (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(new Date(), i - 1));
            const [newCustomers, total] = await Promise.all([
                this.prisma.customer.count({
                    where: {
                        tenant_id: tenantId,
                        deleted_at: null,
                        created_at: { gte: monthStart, lt: monthEnd },
                    },
                }),
                this.prisma.customer.count({
                    where: { tenant_id: tenantId, deleted_at: null, created_at: { lt: monthEnd } },
                }),
            ]);
            result.push({
                month: (0, date_fns_1.format)(monthStart, 'MMM yyyy'),
                new_customers: newCustomers,
                total,
            });
        }
        return result;
    }
    async getTopCustomers(tenantId, limit = 5) {
        return this.prisma.customer.findMany({
            where: { tenant_id: tenantId, deleted_at: null },
            orderBy: { total_spent: 'desc' },
            take: limit,
            select: {
                id: true,
                name: true,
                phone: true,
                status: true,
                total_orders: true,
                total_spent: true,
                _count: { select: { conversations: true } },
            },
        });
    }
    async getInvoiceBreakdown(tenantId) {
        const byStatus = await this.prisma.invoice.groupBy({
            by: ['status'],
            where: { tenant_id: tenantId },
            _count: { id: true },
            _sum: { total: true },
        });
        const colors = {
            DRAFT: '#6b7280',
            SENT: '#3b82f6',
            PARTIALLY_PAID: '#f59e0b',
            PAID: '#10b981',
            OVERDUE: '#ef4444',
            CANCELLED: '#4b5563',
        };
        return byStatus.map((row) => ({
            status: row.status,
            count: row._count.id,
            total: row._sum.total || 0,
            color: colors[row.status] || '#6b7280',
        }));
    }
    async getMessageStats(tenantId) {
        const result = [];
        for (let i = 13; i >= 0; i--) {
            const day = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(new Date(), i));
            const nextDay = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(new Date(), i - 1));
            const count = await this.prisma.message.count({
                where: {
                    tenant_id: tenantId,
                    created_at: { gte: day, lt: nextDay },
                },
            });
            result.push({ date: (0, date_fns_1.format)(day, 'dd MMM'), messages: count });
        }
        return result;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map