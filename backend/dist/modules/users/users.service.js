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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const argon2 = require("argon2");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
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
    async create(tenantId, dto, actorId) {
        const existingUser = await this.prisma.user.findFirst({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Alamat email sudah digunakan.');
        }
        if (dto.role === client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Aksi ditolak: Peran SUPER_ADMIN hanya dapat ditugaskan oleh sistem pusat.');
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
    async update(tenantId, userId, data, actorId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, tenant_id: tenantId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Anggota tim tidak ditemukan.');
        }
        if (data.is_active === false && user.role === client_1.UserRole.OWNER) {
            const ownerCount = await this.prisma.user.count({
                where: { tenant_id: tenantId, role: client_1.UserRole.OWNER, is_active: true },
            });
            if (ownerCount <= 1) {
                throw new common_1.ForbiddenException('Aksi ditolak: Tidak dapat menonaktifkan satu-satunya OWNER perusahaan.');
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
    async disable(tenantId, userId, actorId) {
        return this.update(tenantId, userId, { is_active: false }, actorId);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map