import { ReportsService } from './reports.service';
interface TenantRequest {
    tenantId?: string;
}
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getSummary(req: TenantRequest): Promise<{
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
    getRevenueTrend(req: TenantRequest, days?: string): Promise<{
        date: string;
        revenue: number;
        orders: number;
    }[]>;
    getOrderStats(req: TenantRequest): Promise<{
        status: import(".prisma/client").$Enums.OrderStatus;
        count: number;
        total: number;
    }[]>;
    getCustomerStats(req: TenantRequest): Promise<{
        month: string;
        new_customers: number;
        total: number;
    }[]>;
    getTopCustomers(req: TenantRequest, limit?: string): Promise<{
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
    getInvoiceStats(req: TenantRequest): Promise<{
        status: import(".prisma/client").$Enums.InvoiceStatus;
        count: number;
        total: number;
        color: string;
    }[]>;
    getMessageStats(req: TenantRequest): Promise<{
        date: string;
        messages: number;
    }[]>;
}
export {};
