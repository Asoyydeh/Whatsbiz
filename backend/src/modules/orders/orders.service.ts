import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderDto, OrderStatusEnum } from './dto/order.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';

// Kanban columns in display order
export const KANBAN_COLUMNS: OrderStatusEnum[] = [
  OrderStatusEnum.DRAFT,
  OrderStatusEnum.PENDING,
  OrderStatusEnum.PROCESSING,
  OrderStatusEnum.COMPLETED,
];

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {}

  private generateOrderNumber(): string {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${y}${m}${d}-${rand}`;
  }

  async getKanbanBoard(tenantId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        tenant_id: tenantId,
        status: { in: KANBAN_COLUMNS as any[] },
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
        order_items: true,
        _count: { select: { invoices: true } },
      },
      orderBy: { updated_at: 'desc' },
    });

    // Group into kanban columns
    const board = KANBAN_COLUMNS.reduce(
      (acc, status) => {
        acc[status] = orders.filter((o) => o.status === status);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return board;
  }

  async getOrders(tenantId: string, page = 1, limit = 20, status?: string) {
    const where: any = { tenant_id: tenantId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          order_items: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit };
  }

  async getOrderById(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenant_id: tenantId },
      include: {
        customer: true,
        order_items: true,
        invoices: {
          include: { payments: true },
        },
      },
    });

    if (!order) throw new NotFoundException('Pesanan tidak ditemukan.');
    return order;
  }

  async createOrder(tenantId: string, userId: string, dto: CreateOrderDto) {
    const subtotal = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = dto.discount || 0;
    const tax = dto.tax || 0;
    const total = subtotal - discount + tax;

    const order = await this.prisma.order.create({
      data: {
        tenant_id: tenantId,
        customer_id: dto.customer_id,
        order_number: this.generateOrderNumber(),
        status: 'DRAFT',
        subtotal,
        discount,
        tax,
        total,
        order_items: {
          create: dto.items.map((item) => ({
            tenant_id: tenantId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        order_items: true,
      },
    });

    // Update customer total_orders
    await this.prisma.customer.update({
      where: { id: dto.customer_id },
      data: {
        total_orders: { increment: 1 },
        total_spent: { increment: total },
      },
    });

    // Trigger WhatsApp Automations for NEW_ORDER trigger
    this.triggerNewOrderAutomations(tenantId, order).catch((err) => {
      console.error('Error running NEW_ORDER automations:', err);
    });

    return order;
  }

  private async triggerNewOrderAutomations(tenantId: string, order: any) {
    const automations = await this.prisma.automation.findMany({
      where: {
        tenant_id: tenantId,
        is_active: true,
      },
    });

    for (const auto of automations) {
      let config: any = {};
      try {
        config = JSON.parse(auto.trigger);
      } catch {
        continue;
      }

      if (config.trigger === 'NEW_ORDER') {
        const actions = config.actions || [];
        for (const action of actions) {
          if (action.type === 'SEND_WHATSAPP') {
            const template = action.config?.message || '';
            const resolvedMessage = template
              .replace(/\{\{\s*customer_name\s*\}\}/g, order.customer?.name || '')
              .replace(/\{\{\s*order_total\s*\}\}/g, new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total))
              .replace(/\{\{\s*order_number\s*\}\}/g, order.order_number);

            if (order.customer?.phone) {
              await this.whatsappService.sendTextMessage(order.customer.phone, resolvedMessage);
            }
          }
        }
      }
    }
  }

  async updateOrderStatus(tenantId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenant_id: tenantId },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan.');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status as any },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        order_items: true,
      },
    });
  }

  async updateOrder(tenantId: string, orderId: string, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenant_id: tenantId },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan.');

    const updateData: any = {};

    if (dto.items) {
      const subtotal = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discount = dto.discount ?? order.discount;
      const tax = dto.tax ?? order.tax;
      updateData.subtotal = subtotal;
      updateData.discount = discount;
      updateData.tax = tax;
      updateData.total = subtotal - discount + tax;

      // Delete existing items and re-create
      await this.prisma.orderItem.deleteMany({ where: { order_id: orderId } });
      updateData.order_items = {
        create: dto.items.map((item) => ({
          tenant_id: tenantId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        order_items: true,
      },
    });
  }

  async deleteOrder(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenant_id: tenantId },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan.');
    if (['COMPLETED', 'DELIVERED'].includes(order.status)) {
      throw new ForbiddenException('Pesanan yang sudah selesai tidak bisa dihapus.');
    }

    await this.prisma.orderItem.deleteMany({ where: { order_id: orderId } });
    await this.prisma.order.delete({ where: { id: orderId } });
    return { message: 'Pesanan berhasil dihapus.' };
  }

  async getOrderStats(tenantId: string) {
    const [total, byStatus, revenueResult] = await Promise.all([
      this.prisma.order.count({ where: { tenant_id: tenantId } }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: { tenant_id: tenantId },
        _count: { id: true },
      }),
      this.prisma.order.aggregate({
        where: { tenant_id: tenantId, status: 'COMPLETED' },
        _sum: { total: true },
      }),
    ]);

    const counts = byStatus.reduce(
      (acc, row) => {
        acc[row.status] = row._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      counts,
      totalRevenue: revenueResult._sum.total || 0,
    };
  }
}
