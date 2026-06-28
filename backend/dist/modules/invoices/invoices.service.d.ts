import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto, RecordPaymentDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class InvoicesService {
    private readonly prisma;
    private readonly whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsappService);
    private generateInvoiceNumber;
    getInvoices(tenantId: string, page?: number, limit?: number, status?: string, search?: string): Promise<{
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
    getInvoiceById(tenantId: string, invoiceId: string): Promise<{
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
    createInvoice(tenantId: string, dto: CreateInvoiceDto): Promise<{
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
    recordPayment(tenantId: string, invoiceId: string, dto: RecordPaymentDto): Promise<{
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
    private triggerPaymentReceivedAutomations;
    updateStatus(tenantId: string, invoiceId: string, dto: UpdateInvoiceStatusDto): Promise<{
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
    getInvoiceStats(tenantId: string): Promise<{
        total: number;
        counts: Record<string, {
            count: number;
            sum: number;
        }>;
        totalPaid: number;
        overdueCount: number;
    }>;
    getInvoiceForExport(tenantId: string, invoiceId: string): Promise<{
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
    getWhatsappMessage(invoice: any): string;
}
