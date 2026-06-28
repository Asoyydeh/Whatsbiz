import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/ws',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { tenantId: string; userId: string }>();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.emit('error', { message: 'Autentikasi diperlukan.' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'supersecretjwtkeythatisverylongandsecure123!',
      });

      const { sub: userId, tenantId } = payload;

      // Store user context
      this.connectedUsers.set(client.id, { tenantId, userId });

      // Join tenant-specific room for message isolation
      client.join(`tenant:${tenantId}`);

      client.emit('connected', { message: 'Terhubung ke WhatsBiz Real-time Engine' });
      console.log(`[WS] Client ${client.id} connected | User: ${userId} | Tenant: ${tenantId}`);
    } catch (err) {
      client.emit('error', { message: 'Token tidak valid.' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      console.log(`[WS] Client ${client.id} disconnected | User: ${user.userId}`);
      this.connectedUsers.delete(client.id);
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) {
      client.emit('error', { message: 'Tidak terautentikasi.' });
      return;
    }

    try {
      const message = await this.messagesService.saveMessage(user.tenantId, user.userId, dto);

      // Broadcast ONLY to users in the same tenant room
      this.server.to(`tenant:${user.tenantId}`).emit('message:new', {
        message,
        conversationId: dto.conversation_id,
      });

      return { success: true, message };
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    // Broadcast typing indicator to tenant room (excluding sender)
    client.to(`tenant:${user.tenantId}`).emit('typing:update', {
      conversationId: data.conversationId,
      userId: user.userId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    client.to(`tenant:${user.tenantId}`).emit('typing:update', {
      conversationId: data.conversationId,
      userId: user.userId,
      isTyping: false,
    });
  }

  @SubscribeMessage('conversation:join')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    client.join(`conversation:${data.conversationId}`);
    client.emit('conversation:joined', { conversationId: data.conversationId });
  }

  // Utility method for emitting order/notification updates from other modules
  emitToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }
}
