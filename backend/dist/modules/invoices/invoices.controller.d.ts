import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, RecordPaymentDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    getStats(req: any): Promise<{
        total: number;
        counts: Record<string, {
            count: number;
            sum: number;
        }>;
        totalPaid: number;
        overdueCount: number;
    }>;
    getInvoices(req: any, page?: string, limit?: string, status?: string, search?: string): Promise<{
        invoices: ({
            order: {
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
            };
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
        total: number;
        page: number;
        limit: number;
    }>;
    getInvoice(req: any, id: string): Promise<{
        order: {
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
        };
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
    }>;
    createInvoice(req: any, dto: CreateInvoiceDto): Promise<{
        order: {
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
        };
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
    }>;
    recordPayment(req: any, id: string, dto: RecordPaymentDto): Promise<{
        order: {
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
        };
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
    }>;
    updateStatus(req: any, id: string, dto: UpdateInvoiceStatusDto): Promise<{
        order: {
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
        };
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
    }>;
    getWhatsappMessage(req: any, id: string): Promise<{
        message: string;
        waUrl: string;
        phone: string;
    }>;
    exportInvoice(req: any, id: string): Promise<{
        order: {
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
        };
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
    }>;
}
