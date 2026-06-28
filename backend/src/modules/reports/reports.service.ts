import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { subDays, startOfDay, format, startOfMonth, subMonths } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      activeConversations,
      revenueThisMonth,
      revenueLastMonth,
      ordersThisMonth,
      ordersLastMonth,
      customersThisMonth,
      customersLastMonth,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { tenant_id: tenantId, status: 'PAID' },
        _sum: { paid_amount: true },
      }),
      this.prisma.order.count({ where: { tenant_id: tenantId } }),
      this.prisma.customer.count({ where: { tenant_id: tenantId, deleted_at: null } }),
      this.prisma.conversation.count({ where: { tenant_id: tenantId, status: 'OPEN' } }),
      // This month
      this.prisma.invoice.aggregate({
        where: { tenant_id: tenantId, status: 'PAID', created_at: { gte: startOfThisMonth } },
        _sum: { paid_amount: true },
      }),
      // Last month
      this.prisma.invoice.aggregate({
        where: { tenant_id: tenantId, status: 'PAID', created_at: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { paid_amount: true },
      }),
      this.prisma.order.count({ where: { tenant_id: tenantId, created_at: { gte: startOfThisMonth } } }),
      this.prisma.order.count({ where: { tenant_id: tenantId, created_at: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      this.prisma.customer.count({ where: { tenant_id: tenantId, created_at: { gte: startOfThisMonth } } }),
      this.prisma.customer.count({ where: { tenant_id: tenantId, created_at: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    ]);

    const calcGrowth = (current: number, previous: number) =>
      previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);

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

  async getRevenueTrend(tenantId: string, days = 30) {
    const result: { date: string; revenue: number; orders: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const nextDay = startOfDay(subDays(new Date(), i - 1));

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
        date: format(day, 'dd MMM'),
        revenue: revenue._sum.paid_amount || 0,
        orders,
      });
    }

    return result;
  }

  async getOrderStats(tenantId: string) {
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

  async getCustomerStats(tenantId: string) {
    const result: { month: string; new_customers: number; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = i === 0 ? new Date() : startOfMonth(subMonths(new Date(), i - 1));

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
        month: format(monthStart, 'MMM yyyy'),
        new_customers: newCustomers,
        total,
      });
    }

    return result;
  }

  async getTopCustomers(tenantId: string, limit = 5) {
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

  async getInvoiceBreakdown(tenantId: string) {
    const byStatus = await this.prisma.invoice.groupBy({
      by: ['status'],
      where: { tenant_id: tenantId },
      _count: { id: true },
      _sum: { total: true },
    });

    const colors: Record<string, string> = {
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

  async getMessageStats(tenantId: string) {
    const result: { date: string; messages: number }[] = [];

    for (let i = 13; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const nextDay = startOfDay(subDays(new Date(), i - 1));

      const count = await this.prisma.message.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: day, lt: nextDay },
        },
      });

      result.push({ date: format(day, 'dd MMM'), messages: count });
    }

    return result;
  }
}
