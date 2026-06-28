import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: { users: true, customers: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Data tenant tidak ditemukan.');
    }

    return tenant;
  }

  async updateProfile(tenantId: string, data: { name?: string; domain?: string }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Data tenant tidak ditemukan.');
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name ?? tenant.name,
        domain: data.domain ?? tenant.domain,
      },
    });
  }
}
