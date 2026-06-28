import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { Request, Response } from 'express';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(req: Request, query: QueryCustomerDto): Promise<{
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
    exportCSV(req: Request, res: Response, query: QueryCustomerDto): Promise<Response<any, Record<string, any>>>;
    importCSV(req: Request, body: {
        csv_content?: string;
    }, file?: any): Promise<{
        success: boolean;
        count: number;
        message: string;
    } | {
        success: boolean;
        count: number;
        message?: undefined;
    }>;
    findOne(req: Request, id: string): Promise<{
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
    create(req: Request, createCustomerDto: CreateCustomerDto): Promise<{
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
    update(req: Request, id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
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
    delete(req: Request, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
