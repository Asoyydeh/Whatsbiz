import { PrismaService } from '../../database/prisma.service';
import { SendMessageDto, CreateConversationDto } from './dto/send-message.dto';
export declare class MessagesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getConversations(tenantId: string): Promise<({
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
    getOrCreateConversation(tenantId: string, dto: CreateConversationDto): Promise<{
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
    getMessages(tenantId: string, conversationId: string, page?: number, limit?: number): Promise<{
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
    saveMessage(tenantId: string, senderId: string, dto: SendMessageDto): Promise<{
        type: import(".prisma/client").$Enums.MessageType;
        id: string;
        tenant_id: string;
        created_at: Date;
        status: string;
        content: string;
        conversation_id: string;
        sender_id: string | null;
        media_url: string | null;
    }>;
    markAsRead(tenantId: string, conversationId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getConversationWithCustomer(tenantId: string, conversationId: string): Promise<{
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
}
