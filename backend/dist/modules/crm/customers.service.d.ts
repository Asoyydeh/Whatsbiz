import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, query: QueryCustomerDto): Promise<{
        data: ({
            tags: {
                id: string;
                tenant_id: string;
                tag: string;
                customer_id: string;
            }[];
        } & {
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
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    findOne(tenantId: string, id: string): Promise<{
        timeline: any[];
        tags: {
            id: string;
            tenant_id: string;
            tag: string;
            customer_id: string;
        }[];
        conversations: {
            id: string;
            tenant_id: string;
            created_at: Date;
            updated_at: Date;
            status: import(".prisma/client").$Enums.ConversationStatus;
            customer_id: string;
            assigned_to: string | null;
            last_message: string | null;
            unread_count: number;
        }[];
        orders: {
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
        }[];
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
    }>;
    create(tenantId: string, dto: CreateCustomerDto, actorId: string): Promise<{
        tags: {
            id: string;
            tenant_id: string;
            tag: string;
            customer_id: string;
        }[];
    } & {
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
    }>;
    update(tenantId: string, id: string, dto: UpdateCustomerDto, actorId: string): Promise<{
        tags: {
            id: string;
            tenant_id: string;
            tag: string;
            customer_id: string;
        }[];
    } & {
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
    }>;
    delete(tenantId: string, id: string, actorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    exportCSV(tenantId: string, query: QueryCustomerDto): Promise<string>;
    importCSV(tenantId: string, csvContent: string, actorId: string): Promise<{
        success: boolean;
        count: number;
        message: string;
    } | {
        success: boolean;
        count: number;
        message?: undefined;
    }>;
    private escapeCSV;
    private parseCSV;
}
