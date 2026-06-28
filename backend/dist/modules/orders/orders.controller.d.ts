import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderDto } from './dto/order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getKanban(req: any): Promise<Record<string, any[]>>;
    getStats(req: any): Promise<{
        total: number;
        counts: Record<string, number>;
        totalRevenue: number;
    }>;
    getOrders(req: any, page?: string, limit?: string, status?: string): Promise<{
        orders: ({
            customer: {
                name: string;
                id: string;
                phone: string;
            };
            order_items: {
                name: string;
                id: string;
                tenant_id: string;
                quantity: number;
                price: number;
                order_id: string;
            }[];
        } & {
            id: string;
            tenant_id: string;
            created_at: Date;
            updated_at: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            customer_id: string;
            total: number;
            order_number: string;
            subtotal: number;
            tax: number;
            discount: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getOrder(req: any, id: string): Promise<{
        customer: {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            created_at: Date;
            updated_at: Date;
            status: import(".prisma/client").$Enums.CustomerStatus;
            phone: string;
            address: string | null;
            total_orders: number;
            total_spent: number;
            last_contact: Date | null;
            deleted_at: Date | null;
        };
        order_items: {
            name: string;
            id: string;
            tenant_id: string;
            quantity: number;
            price: number;
            order_id: string;
        }[];
        invoices: ({
            payments: {
                id: string;
                tenant_id: string;
                created_at: Date;
                method: import(".prisma/client").$Enums.PaymentMethod;
                amount: number;
                invoice_id: string;
            }[];
        } & {
            id: string;
            tenant_id: string;
            created_at: Date;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            total: number;
            order_id: string;
            due_date: Date | null;
            invoice_number: string;
            paid_amount: number;
        })[];
    } & {
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customer_id: string;
        total: number;
        order_number: string;
        subtotal: number;
        tax: number;
        discount: number;
    }>;
    createOrder(req: any, dto: CreateOrderDto): Promise<{
        customer: {
            name: string;
            id: string;
            phone: string;
        };
        order_items: {
            name: string;
            id: string;
            tenant_id: string;
            quantity: number;
            price: number;
            order_id: string;
        }[];
    } & {
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customer_id: string;
        total: number;
        order_number: string;
        subtotal: number;
        tax: number;
        discount: number;
    }>;
    updateStatus(req: any, id: string, dto: UpdateOrderStatusDto): Promise<{
        customer: {
            name: string;
            id: string;
            phone: string;
        };
        order_items: {
            name: string;
            id: string;
            tenant_id: string;
            quantity: number;
            price: number;
            order_id: string;
        }[];
    } & {
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customer_id: string;
        total: number;
        order_number: string;
        subtotal: number;
        tax: number;
        discount: number;
    }>;
    updateOrder(req: any, id: string, dto: UpdateOrderDto): Promise<{
        customer: {
            name: string;
            id: string;
            phone: string;
        };
        order_items: {
            name: string;
            id: string;
            tenant_id: string;
            quantity: number;
            price: number;
            order_id: string;
        }[];
    } & {
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customer_id: string;
        total: number;
        order_number: string;
        subtotal: number;
        tax: number;
        discount: number;
    }>;
    deleteOrder(req: any, id: string): Promise<{
        message: string;
    }>;
}
