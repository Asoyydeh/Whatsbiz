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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let MessagesService = class MessagesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConversations(tenantId) {
        return this.prisma.conversation.findMany({
            where: { tenant_id: tenantId },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        status: true,
                        tags: { select: { tag: true } },
                    },
                },
            },
            orderBy: { updated_at: 'desc' },
        });
    }
    async getOrCreateConversation(tenantId, dto) {
        const existing = await this.prisma.conversation.findFirst({
            where: { tenant_id: tenantId, customer_id: dto.customer_id },
            include: { customer: true },
        });
        if (existing)
            return existing;
        return this.prisma.conversation.create({
            data: {
                tenant_id: tenantId,
                customer_id: dto.customer_id,
                status: 'OPEN',
            },
            include: { customer: true },
        });
    }
    async getMessages(tenantId, conversationId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: conversationId, tenant_id: tenantId },
        });
        if (!conversation)
            return { messages: [], total: 0 };
        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: { conversation_id: conversationId, tenant_id: tenantId },
                orderBy: { created_at: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.message.count({
                where: { conversation_id: conversationId, tenant_id: tenantId },
            }),
        ]);
        return { messages, total, page, limit };
    }
    async saveMessage(tenantId, senderId, dto) {
        const conversation = await this.prisma.conversation.findFirst({
            where: { id: dto.conversation_id, tenant_id: tenantId },
        });
        if (!conversation)
            throw new Error('Conversation not found');
        const message = await this.prisma.message.create({
            data: {
                tenant_id: tenantId,
                conversation_id: dto.conversation_id,
                sender_id: senderId,
                type: dto.type || 'TEXT',
                content: dto.content,
                media_url: dto.media_url,
                status: 'sent',
            },
        });
        await this.prisma.conversation.update({
            where: { id: dto.conversation_id },
            data: {
                last_message: dto.content,
                updated_at: new Date(),
            },
        });
        return message;
    }
    async markAsRead(tenantId, conversationId) {
        return this.prisma.conversation.updateMany({
            where: { id: conversationId, tenant_id: tenantId },
            data: { unread_count: 0 },
        });
    }
    async getConversationWithCustomer(tenantId, conversationId) {
        return this.prisma.conversation.findFirst({
            where: { id: conversationId, tenant_id: tenantId },
            include: {
                customer: {
                    include: {
                        tags: { select: { tag: true } },
                        orders: {
                            select: {
                                id: true,
                                order_number: true,
                                status: true,
                                total: true,
                                created_at: true,
                            },
                            orderBy: { created_at: 'desc' },
                            take: 5,
                        },
                    },
                },
            },
        });
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map