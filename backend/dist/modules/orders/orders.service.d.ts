import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderDto, OrderStatusEnum } from './dto/order.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare const KANBAN_COLUMNS: OrderStatusEnum[];
export declare class OrdersService {
    private readonly prisma;
    private readonly whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    private generateOrderNumber;
    getKanbanBoard(tenantId: string): Promise<Record<string, any[]>>;
    getOrders(tenantId: string, page?: number, limit?: number, status?: string): Promise<{
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
    getOrderById(tenantId: string, orderId: string): Promise<{
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
    createOrder(tenantId: string, userId: string, dto: CreateOrderDto): Promise<{
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
    private triggerNewOrderAutomations;
    updateOrderStatus(tenantId: string, orderId: string, dto: UpdateOrderStatusDto): Promise<{
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
    updateOrder(tenantId: string, orderId: string, dto: UpdateOrderDto): Promise<{
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
    deleteOrder(tenantId: string, orderId: string): Promise<{
        message: string;
    }>;
    getOrderStats(tenantId: string): Promise<{
        total: number;
        counts: Record<string, number>;
        totalRevenue: number;
    }>;
}
