import { MessagesService } from './messages.service';
import { CreateConversationDto } from './dto/send-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    getConversations(req: any): Promise<({
        customer: {
            name: string;
            id: string;
            status: import(".prisma/client").$Enums.CustomerStatus;
            tags: {
                tag: string;
            }[];
            phone: string;
        };
    } & {
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.ConversationStatus;
        customer_id: string;
        assigned_to: string | null;
        last_message: string | null;
        unread_count: number;
    })[]>;
    createConversation(req: any, dto: CreateConversationDto): Promise<{
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
    } & {
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.ConversationStatus;
        customer_id: string;
        assigned_to: string | null;
        last_message: string | null;
        unread_count: number;
    }>;
    getConversationDetail(req: any, id: string): Promise<{
        customer: {
            tags: {
                tag: string;
            }[];
            orders: {
                id: string;
                created_at: Date;
                status: import(".prisma/client").$Enums.OrderStatus;
                total: number;
                order_number: string;
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
        };
    } & {
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.ConversationStatus;
        customer_id: string;
        assigned_to: string | null;
        last_message: string | null;
        unread_count: number;
    }>;
    getMessages(req: any, id: string, page?: string, limit?: string): Promise<{
        messages: any[];
        total: number;
        page?: undefined;
        limit?: undefined;
    } | {
        messages: {
            type: import(".prisma/client").$Enums.MessageType;
            id: string;
            tenant_id: string;
            created_at: Date;
            status: string;
            content: string;
            conversation_id: string;
            sender_id: string | null;
            media_url: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    markAsRead(req: any, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
