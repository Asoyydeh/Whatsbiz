import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SendMessageDto, CreateConversationDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getConversations(tenantId: string) {
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

  async getOrCreateConversation(tenantId: string, dto: CreateConversationDto) {
    const existing = await this.prisma.conversation.findFirst({
      where: { tenant_id: tenantId, customer_id: dto.customer_id },
      include: { customer: true },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        tenant_id: tenantId,
        customer_id: dto.customer_id,
        status: 'OPEN',
      },
      include: { customer: true },
    });
  }

  async getMessages(tenantId: string, conversationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    // Ensure conversation belongs to this tenant
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenant_id: tenantId },
    });
    if (!conversation) return { messages: [], total: 0 };

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

  async saveMessage(tenantId: string, senderId: string, dto: SendMessageDto) {
    // Verify conversation belongs to tenant
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: dto.conversation_id, tenant_id: tenantId },
    });
    if (!conversation) throw new Error('Conversation not found');

    const message = await this.prisma.message.create({
      data: {
        tenant_id: tenantId,
        conversation_id: dto.conversation_id,
        sender_id: senderId,
        type: (dto.type as any) || 'TEXT',
        content: dto.content,
        media_url: dto.media_url,
        status: 'sent',
      },
    });

    // Update conversation last_message and updated_at
    await this.prisma.conversation.update({
      where: { id: dto.conversation_id },
      data: {
        last_message: dto.content,
        updated_at: new Date(),
      },
    });

    return message;
  }

  async markAsRead(tenantId: string, conversationId: string) {
    return this.prisma.conversation.updateMany({
      where: { id: conversationId, tenant_id: tenantId },
      data: { unread_count: 0 },
    });
  }

  async getConversationWithCustomer(tenantId: string, conversationId: string) {
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
}
