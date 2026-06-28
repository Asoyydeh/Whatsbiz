import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateInvoiceDto,
  RecordPaymentDto,
  UpdateInvoiceStatusDto,
  InvoiceStatusEnum,
} from './dto/invoice.dto';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {}

  private generateInvoiceNumber(): string {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${y}${m}${d}-${rand}`;
  }

  async getInvoices(
    tenantId: string,
    page = 1,
    limit = 20,
    status?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenant_id: tenantId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoice_number: { contains: search, mode: 'insensitive' } },
        { order: { customer: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          order: {
            include: {
              customer: { select: { id: true, name: true, phone: true } },
              order_items: true,
            },
          },
          payments: { orderBy: { created_at: 'desc' } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { invoices, total, page, limit };
  }

  async getInvoiceById(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenant_id: tenantId },
      include: {
        order: {
          include: {
            customer: true,
            order_items: true,
          },
        },
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice tidak ditemukan.');
    return invoice;
  }

  async createInvoice(tenantId: string, dto: CreateInvoiceDto) {
    // Verify order belongs to tenant
    const order = await this.prisma.order.findFirst({
      where: { id: dto.order_id, tenant_id: tenantId },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan.');

    return this.prisma.invoice.create({
      data: {
        tenant_id: tenantId,
        order_id: dto.order_id,
        invoice_number: this.generateInvoiceNumber(),
        status: 'DRAFT',
        total: order.total,
        paid_amount: 0,
        due_date: dto.due_date ? new Date(dto.due_date) : undefined,
      },
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            order_items: true,
          },
        },
        payments: true,
      },
    });
  }

  async recordPayment(tenantId: string, invoiceId: string, dto: RecordPaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenant_id: tenantId },
    });
    if (!invoice) throw new NotFoundException('Invoice tidak ditemukan.');
    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice ini sudah lunas.');
    }

    const newPaidAmount = invoice.paid_amount + dto.amount;
    if (newPaidAmount > invoice.total) {
      throw new BadRequestException(
        `Jumlah pembayaran melebihi total invoice (Rp ${invoice.total.toLocaleString('id-ID')}).`,
      );
    }

    // Determine new status
    let newStatus: string;
    if (newPaidAmount >= invoice.total) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIALLY_PAID';
    } else {
      newStatus = invoice.status;
    }

    // Record payment + update invoice atomically
    const [payment, updatedInvoice] = await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          tenant_id: tenantId,
          invoice_id: invoiceId,
          method: dto.method as any,
          amount: dto.amount,
        },
      }),
      this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { paid_amount: newPaidAmount, status: newStatus as any },
        include: {
          order: {
            include: {
              customer: { select: { id: true, name: true, phone: true } },
              order_items: true,
            },
          },
          payments: true,
        },
      }),
    ]);

    // Trigger WhatsApp Automations for PAYMENT_RECEIVED trigger
    this.triggerPaymentReceivedAutomations(tenantId, updatedInvoice).catch((err) => {
      console.error('Error running PAYMENT_RECEIVED automations:', err);
    });

    return updatedInvoice;
  }

  private async triggerPaymentReceivedAutomations(tenantId: string, invoice: any) {
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

      if (config.trigger === 'PAYMENT_RECEIVED') {
        const actions = config.actions || [];
        for (const action of actions) {
          if (action.type === 'SEND_WHATSAPP') {
            const template = action.config?.message || '';
            const resolvedMessage = template
              .replace(/\{\{\s*customer_name\s*\}\}/g, invoice.order?.customer?.name || '')
              .replace(/\{\{\s*invoice_total\s*\}\}/g, new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(invoice.total))
              .replace(/\{\{\s*invoice_number\s*\}\}/g, invoice.invoice_number);

            const phone = invoice.order?.customer?.phone;
            if (phone) {
              await this.whatsappService.sendTextMessage(phone, resolvedMessage);
            }
          }
        }
      }
    }
  }

  async updateStatus(tenantId: string, invoiceId: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenant_id: tenantId },
    });
    if (!invoice) throw new NotFoundException('Invoice tidak ditemukan.');

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: dto.status as any },
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            order_items: true,
          },
        },
        payments: true,
      },
    });
  }

  async getInvoiceStats(tenantId: string) {
    const [total, byStatus, totalRevenue, overdueCount] = await Promise.all([
      this.prisma.invoice.count({ where: { tenant_id: tenantId } }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: { tenant_id: tenantId },
        _count: { id: true },
        _sum: { total: true },
      }),
      this.prisma.invoice.aggregate({
        where: { tenant_id: tenantId, status: 'PAID' },
        _sum: { paid_amount: true },
      }),
      this.prisma.invoice.count({
        where: {
          tenant_id: tenantId,
          status: 'OVERDUE',
        },
      }),
    ]);

    const counts = byStatus.reduce(
      (acc, row) => {
        acc[row.status] = { count: row._count.id, sum: row._sum.total || 0 };
        return acc;
      },
      {} as Record<string, { count: number; sum: number }>,
    );

    return {
      total,
      counts,
      totalPaid: totalRevenue._sum.paid_amount || 0,
      overdueCount,
    };
  }

  /** Generate plain-text invoice data for PDF (frontend renders it) */
  async getInvoiceForExport(tenantId: string, invoiceId: string) {
    const invoice = await this.getInvoiceById(tenantId, invoiceId);
    return invoice; // Frontend will render the PDF using jsPDF or similar
  }

  /** Generate WhatsApp message text for invoice */
  getWhatsappMessage(invoice: any): string {
    const customer = invoice.order?.customer;
    const items = invoice.order?.order_items || [];

    const itemLines = items
      .map((i: any) => `  • ${i.name} x${i.quantity} = Rp ${(i.price * i.quantity).toLocaleString('id-ID')}`)
      .join('\n');

    return (
      `*Invoice #${invoice.invoice_number}*\n\n` +
      `Halo ${customer?.name || 'Pelanggan'},\n` +
      `Berikut tagihan Anda:\n\n` +
      `${itemLines}\n\n` +
      `*Total: Rp ${invoice.total.toLocaleString('id-ID')}*\n` +
      (invoice.due_date
        ? `Jatuh tempo: ${new Date(invoice.due_date).toLocaleDateString('id-ID')}\n`
        : '') +
      `\nTerima kasih telah berbelanja! 🙏`
    );
  }
}
