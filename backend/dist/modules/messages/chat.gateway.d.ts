import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly messagesService;
    private readonly jwtService;
    server: Server;
    private connectedUsers;
    constructor(messagesService: MessagesService, jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleSendMessage(client: Socket, dto: SendMessageDto): Promise<{
        success: boolean;
        message: {
            type: import(".prisma/client").$Enums.MessageType;
            id: string;
            tenant_id: string;
            created_at: Date;
            status: string;
            content: string;
            conversation_id: string;
            sender_id: string | null;
            media_url: string | null;
        };
    }>;
    handleTypingStart(client: Socket, data: {
        conversationId: string;
    }): void;
    handleTypingStop(client: Socket, data: {
        conversationId: string;
    }): void;
    handleJoinConversation(client: Socket, data: {
        conversationId: string;
    }): void;
    emitToTenant(tenantId: string, event: string, data: any): void;
}
