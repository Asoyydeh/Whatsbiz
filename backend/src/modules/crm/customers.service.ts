import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CustomerStatus, Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryCustomerDto) {
    const { page, limit, search, status, tag } = query;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.CustomerWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (status) {
      whereClause.status = status as CustomerStatus;
    }

    if (tag) {
      whereClause.tags = {
        some: {
          tag: {
            equals: tag,
            mode: 'insensitive',
          },
        },
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.customer.count({ where: whereClause }),
      this.prisma.customer.findMany({
        where: whereClause,
        include: {
          tags: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
      include: {
        tags: true,
        orders: {
          orderBy: { created_at: 'desc' },
        },
        conversations: {
          orderBy: { updated_at: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan.');
    }

    // Dynamic timeline construction
    const timelineEvents: any[] = [];

    // 1. Creation event
    timelineEvents.push({
      id: `created-${customer.id}`,
      type: 'CUSTOMER_CREATED',
      title: 'Pelanggan Dibuat',
      description: `Profil pelanggan atas nama ${customer.name} berhasil didaftarkan.`,
      timestamp: customer.created_at,
    });

    // 2. Orders events
    for (const order of customer.orders) {
      timelineEvents.push({
        id: `order-${order.id}`,
        type: 'ORDER_CREATED',
        title: `Pesanan Baru #${order.order_number}`,
        description: `Pesanan dibuat dengan total nominal Rp ${order.total.toLocaleString('id-ID')}. Status: ${order.status}`,
        timestamp: order.created_at,
      });
    }

    // 3. Messages events
    const conversationIds = customer.conversations.map((c) => c.id);
    if (conversationIds.length > 0) {
      const messages = await this.prisma.message.findMany({
        where: {
          conversation_id: { in: conversationIds },
          tenant_id: tenantId,
        },
        orderBy: { created_at: 'desc' },
        take: 20,
      });

      for (const msg of messages) {
        timelineEvents.push({
          id: `msg-${msg.id}`,
          type: msg.sender_id ? 'MESSAGE_SENT' : 'MESSAGE_RECEIVED',
          title: msg.sender_id ? 'Pesan Keluar (WhatsApp)' : 'Pesan Masuk (WhatsApp)',
          description: msg.content,
          timestamp: msg.created_at,
        });
      }
    }

    // 4. Audit Log events
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        tenant_id: tenantId,
        resource: 'Customer',
        metadata: {
          path: ['target_customer_id'],
          equals: id,
        },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    for (const log of auditLogs) {
      let desc = `Tindakan ${log.action} dilakukan.`;
      if (log.action === 'UPDATE_CUSTOMER') {
        desc = 'Detail profil pelanggan diperbarui.';
      }
      timelineEvents.push({
        id: `audit-${log.id}`,
        type: 'AUDIT_LOG',
        title: log.action,
        description: desc,
        timestamp: log.created_at,
      });
    }

    // Sort timeline by timestamp desc
    timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      ...customer,
      timeline: timelineEvents,
    };
  }

  async create(tenantId: string, dto: CreateCustomerDto, actorId: string) {
    // Check if non-deleted customer with the same phone exists
    const existing = await this.prisma.customer.findFirst({
      where: { tenant_id: tenantId, phone: dto.phone, deleted_at: null },
    });

    if (existing) {
      throw new ConflictException('Nomor telepon pelanggan sudah terdaftar.');
    }

    const { tags, ...customerData } = dto;

    const customer = await this.prisma.$transaction(async (tx) => {
      const newCust = await tx.customer.create({
        data: {
          ...customerData,
          tenant_id: tenantId,
        },
      });

      if (tags && tags.length > 0) {
        await tx.customerTag.createMany({
          data: tags.map((t) => ({
            tenant_id: tenantId,
            customer_id: newCust.id,
            tag: t.trim(),
          })),
        });
      }

      return tx.customer.findUnique({
        where: { id: newCust.id },
        include: { tags: true },
      });
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: actorId,
        action: 'CREATE_CUSTOMER',
        resource: 'Customer',
        metadata: { target_customer_id: customer.id },
      },
    });

    return customer;
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto, actorId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
    });

    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan.');
    }

    const { tags, ...customerData } = dto;

    if (dto.phone && dto.phone !== customer.phone) {
      const phoneConflict = await this.prisma.customer.findFirst({
        where: { tenant_id: tenantId, phone: dto.phone, deleted_at: null },
      });
      if (phoneConflict) {
        throw new ConflictException('Nomor telepon baru sudah terdaftar pada pelanggan lain.');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const up = await tx.customer.update({
        where: { id },
        data: customerData,
      });

      if (tags !== undefined) {
        // Clear previous tags
        await tx.customerTag.deleteMany({
          where: { customer_id: id },
        });

        if (tags.length > 0) {
          await tx.customerTag.createMany({
            data: tags.map((t) => ({
              tenant_id: tenantId,
              customer_id: id,
              tag: t.trim(),
            })),
          });
        }
      }

      return tx.customer.findUnique({
        where: { id },
        include: { tags: true },
      });
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: actorId,
        action: 'UPDATE_CUSTOMER',
        resource: 'Customer',
        metadata: { target_customer_id: id, changes: dto as any },
      },
    });

    return updated;
  }

  async delete(tenantId: string, id: string, actorId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
    });

    if (!customer) {
      throw new NotFoundException('Pelanggan tidak ditemukan.');
    }

    await this.prisma.customer.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: actorId,
        action: 'DELETE_CUSTOMER',
        resource: 'Customer',
        metadata: { target_customer_id: id },
      },
    });

    return { success: true, message: 'Pelanggan berhasil dinonaktifkan.' };
  }

  async exportCSV(tenantId: string, query: QueryCustomerDto) {
    const { search, status, tag } = query;

    const whereClause: Prisma.CustomerWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (status) {
      whereClause.status = status as CustomerStatus;
    }

    if (tag) {
      whereClause.tags = {
        some: {
          tag: {
            equals: tag,
            mode: 'insensitive',
          },
        },
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await this.prisma.customer.findMany({
      where: whereClause,
      include: { tags: true },
      orderBy: { created_at: 'desc' },
    });

    // Format output as CSV
    const headers = ['name', 'phone', 'email', 'address', 'status', 'tags'];
    const rows = customers.map((c) => {
      const tagsStr = c.tags.map((t) => t.tag).join(';');
      return [
        this.escapeCSV(c.name),
        this.escapeCSV(c.phone),
        this.escapeCSV(c.email || ''),
        this.escapeCSV(c.address || ''),
        c.status,
        this.escapeCSV(tagsStr),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  async importCSV(tenantId: string, csvContent: string, actorId: string) {
    const lines = this.parseCSV(csvContent);
    if (lines.length < 2) {
      return { success: false, count: 0, message: 'File CSV kosong atau tidak memiliki data.' };
    }

    const headers = lines[0].map((h) => h.toLowerCase().trim());
    const nameIdx = headers.indexOf('name');
    const phoneIdx = headers.indexOf('phone');
    const emailIdx = headers.indexOf('email');
    const addressIdx = headers.indexOf('address');
    const statusIdx = headers.indexOf('status');
    const tagsIdx = headers.indexOf('tags');

    if (nameIdx === -1 || phoneIdx === -1) {
      throw new Error('CSV wajib memiliki kolom "name" dan "phone".');
    }

    let successCount = 0;

    // Process rows sequentially
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (row.length < 2 || !row[nameIdx] || !row[phoneIdx]) {
        continue; // skip incomplete rows
      }

      const name = row[nameIdx].trim();
      const phone = row[phoneIdx].trim();
      const email = emailIdx !== -1 && row[emailIdx] ? row[emailIdx].trim() : null;
      const address = addressIdx !== -1 && row[addressIdx] ? row[addressIdx].trim() : null;
      
      let status: CustomerStatus = CustomerStatus.LEAD;
      if (statusIdx !== -1 && row[statusIdx]) {
        const rowStatus = row[statusIdx].trim().toUpperCase();
        if (Object.values(CustomerStatus).includes(rowStatus as CustomerStatus)) {
          status = rowStatus as CustomerStatus;
        }
      }

      const tagsRaw = tagsIdx !== -1 && row[tagsIdx] ? row[tagsIdx].trim() : '';
      const tags = tagsRaw ? tagsRaw.split(';').map((t) => t.trim()).filter((t) => t.length > 0) : [];

      // Check if customer already exists for this tenant
      const existing = await this.prisma.customer.findFirst({
        where: { tenant_id: tenantId, phone, deleted_at: null },
      });

      await this.prisma.$transaction(async (tx) => {
        let custId: string;
        if (existing) {
          // Update details
          await tx.customer.update({
            where: { id: existing.id },
            data: { name, email, address, status },
          });
          custId = existing.id;

          // Replace tags
          await tx.customerTag.deleteMany({
            where: { customer_id: custId },
          });
        } else {
          // Create new
          const created = await tx.customer.create({
            data: {
              tenant_id: tenantId,
              name,
              phone,
              email,
              address,
              status,
            },
          });
          custId = created.id;
        }

        if (tags.length > 0) {
          await tx.customerTag.createMany({
            data: tags.map((t) => ({
              tenant_id: tenantId,
              customer_id: custId,
              tag: t,
            })),
          });
        }
      });

      successCount++;
    }

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: actorId,
        action: 'IMPORT_CUSTOMERS',
        resource: 'Customer',
        metadata: { import_count: successCount },
      },
    });

    return { success: true, count: successCount };
  }

  private escapeCSV(val: string): string {
    if (!val) return '';
    const needsQuotes = val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r');
    let res = val;
    if (val.includes('"')) {
      res = val.replace(/"/g, '""');
    }
    return needsQuotes ? `"${res}"` : res;
  }

  private parseCSV(content: string): string[][] {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = '';

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = content[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal);
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip \n
        }
        row.push(currentVal);
        lines.push(row);
        row = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    if (currentVal || row.length > 0) {
      row.push(currentVal);
      lines.push(row);
    }
    return lines;
  }
}
