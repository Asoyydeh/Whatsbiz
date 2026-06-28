"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const messages_service_1 = require("./messages.service");
const send_message_dto_1 = require("./dto/send-message.dto");
let ChatGateway = class ChatGateway {
    constructor(messagesService, jwtService) {
        this.messagesService = messagesService;
        this.jwtService = jwtService;
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
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
            this.connectedUsers.set(client.id, { tenantId, userId });
            client.join(`tenant:${tenantId}`);
            client.emit('connected', { message: 'Terhubung ke WhatsBiz Real-time Engine' });
            console.log(`[WS] Client ${client.id} connected | User: ${userId} | Tenant: ${tenantId}`);
        }
        catch (err) {
            client.emit('error', { message: 'Token tidak valid.' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const user = this.connectedUsers.get(client.id);
        if (user) {
            console.log(`[WS] Client ${client.id} disconnected | User: ${user.userId}`);
            this.connectedUsers.delete(client.id);
        }
    }
    async handleSendMessage(client, dto) {
        const user = this.connectedUsers.get(client.id);
        if (!user) {
            client.emit('error', { message: 'Tidak terautentikasi.' });
            return;
        }
        try {
            const message = await this.messagesService.saveMessage(user.tenantId, user.userId, dto);
            this.server.to(`tenant:${user.tenantId}`).emit('message:new', {
                message,
                conversationId: dto.conversation_id,
            });
            return { success: true, message };
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
    handleTypingStart(client, data) {
        const user = this.connectedUsers.get(client.id);
        if (!user)
            return;
        client.to(`tenant:${user.tenantId}`).emit('typing:update', {
            conversationId: data.conversationId,
            userId: user.userId,
            isTyping: true,
        });
    }
    handleTypingStop(client, data) {
        const user = this.connectedUsers.get(client.id);
        if (!user)
            return;
        client.to(`tenant:${user.tenantId}`).emit('typing:update', {
            conversationId: data.conversationId,
            userId: user.userId,
            isTyping: false,
        });
    }
    handleJoinConversation(client, data) {
        const user = this.connectedUsers.get(client.id);
        if (!user)
            return;
        client.join(`conversation:${data.conversationId}`);
        client.emit('conversation:joined', { conversationId: data.conversationId });
    }
    emitToTenant(tenantId, event, data) {
        this.server.to(`tenant:${tenantId}`).emit(event, data);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinConversation", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: true,
            credentials: true,
        },
        namespace: '/ws',
    }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        jwt_1.JwtService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map