import { PrismaService } from '../../database/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSummary(tenantId: string): Promise<{
        totalRevenue: number;
        totalOrders: number;
        totalCustomers: number;
        activeConversations: number;
        growth: {
            revenue: number;
            orders: number;
            customers: number;
        };
    }>;
    getRevenueTrend(tenantId: string, days?: number): Promise<{
        date: string;
        revenue: number;
        orders: number;
    }[]>;
    getOrderStats(tenantId: string): Promise<{
        status: import(".prisma/client").$Enums.OrderStatus;
        count: number;
        total: number;
    }[]>;
    getCustomerStats(tenantId: string): Promise<{
        month: string;
        new_customers: number;
        total: number;
    }[]>;
    getTopCustomers(tenantId: string, limit?: number): Promise<{
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.CustomerStatus;
        _count: {
            conversations: number;
        };
        phone: string;
        total_orders: number;
        total_spent: number;
    }[]>;
    getInvoiceBreakdown(tenantId: string): Promise<{
        status: import(".prisma/client").$Enums.InvoiceStatus;
        count: number;
        total: number;
        color: string;
    }[]>;
    getMessageStats(tenantId: string): Promise<{
        date: string;
        messages: number;
    }[]>;
}
