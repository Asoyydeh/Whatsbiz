import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenant_id: tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        last_login: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(tenantId: string, dto: CreateUserDto, actorId: string) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Alamat email sudah digunakan.');
    }

    // A Tenant OWNER cannot invite a SUPER_ADMIN
    if (dto.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Aksi ditolak: Peran SUPER_ADMIN hanya dapat ditugaskan oleh sistem pusat.');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const newUser = await this.prisma.user.create({
      data: {
        tenant_id: tenantId,
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        is_active: true,
      },
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: actorId,
        action: 'CREATE_USER',
        resource: 'User',
        metadata: { target_user_id: newUser.id, role: dto.role },
      },
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      is_active: newUser.is_active,
    };
  }

  async update(tenantId: string, userId: string, data: { name?: string; role?: UserRole; is_active?: boolean }, actorId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenant_id: tenantId },
    });

    if (!user) {
      throw new NotFoundException('Anggota tim tidak ditemukan.');
    }

    // Prevent disabling the last OWNER
    if (data.is_active === false && user.role === UserRole.OWNER) {
      const ownerCount = await this.prisma.user.count({
        where: { tenant_id: tenantId, role: UserRole.OWNER, is_active: true },
      });
      if (ownerCount <= 1) {
        throw new ForbiddenException('Aksi ditolak: Tidak dapat menonaktifkan satu-satunya OWNER perusahaan.');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name ?? user.name,
        role: data.role ?? user.role,
        is_active: data.is_active !== undefined ? data.is_active : user.is_active,
      },
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: actorId,
        action: 'UPDATE_USER',
        resource: 'User',
        metadata: { target_user_id: userId, changes: data },
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      is_active: updatedUser.is_active,
    };
  }

  async disable(tenantId: string, userId: string, actorId: string) {
    return this.update(tenantId, userId, { is_active: false }, actorId);
  }
}
