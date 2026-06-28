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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../database/prisma.service");
const redis_service_1 = require("../../database/redis.service");
const argon2 = require("argon2");
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, redisService, jwtService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findFirst({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Alamat email sudah terdaftar. Silakan gunakan email lain.');
        }
        const hashedPassword = await argon2.hash(dto.password);
        const resolvedDomain = dto.company_name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
        return this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: dto.company_name,
                    domain: resolvedDomain,
                    plan: 'FREE',
                    is_active: true,
                },
            });
            const user = await tx.user.create({
                data: {
                    tenant_id: tenant.id,
                    name: dto.name,
                    email: dto.email,
                    password: hashedPassword,
                    role: client_1.UserRole.OWNER,
                    is_active: true,
                },
            });
            await tx.subscription.create({
                data: {
                    tenant_id: tenant.id,
                    plan: 'FREE',
                    status: 'active',
                    start_date: new Date(),
                    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
            await tx.auditLog.create({
                data: {
                    tenant_id: tenant.id,
                    user_id: user.id,
                    action: 'REGISTER',
                    resource: 'Tenant',
                    metadata: { company_name: dto.company_name, email: dto.email },
                },
            });
            return {
                message: 'Registrasi perusahaan dan owner berhasil dilakukan.',
                tenant: { id: tenant.id, name: tenant.name, domain: tenant.domain },
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
            };
        });
    }
    async login(dto, ip, userAgent) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email },
            include: { tenant: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email atau password salah.');
        }
        if (!user.is_active || !user.tenant.is_active) {
            throw new common_1.UnauthorizedException('Akun atau tenant Anda dinonaktifkan. Silakan hubungi admin.');
        }
        const isPasswordValid = await argon2.verify(user.password, dto.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email atau password salah.');
        }
        const tokens = await this.generateTokens(user.id, user.tenant_id, user.role, ip, userAgent);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { last_login: new Date() },
        });
        await this.prisma.auditLog.create({
            data: {
                tenant_id: user.tenant_id,
                user_id: user.id,
                action: 'LOGIN',
                resource: 'User',
                ip_address: ip,
                metadata: { user_agent: userAgent },
            },
        });
        return tokens;
    }
    async refresh(refreshToken, ip, userAgent) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkeythatisverylongandsecure123!',
            });
            const userId = payload.sub;
            const tokenId = payload.jti;
            const tenantId = payload.tenantId;
            const role = payload.role;
            const isUsed = await this.redisService.isTokenUsed(tokenId);
            if (isUsed) {
                await this.redisService.invalidateAllUserSessions(userId);
                await this.prisma.auditLog.create({
                    data: {
                        tenant_id: tenantId,
                        user_id: userId,
                        action: 'SESSION_REVOCATION_ALERT',
                        resource: 'Auth',
                        ip_address: ip,
                        metadata: {
                            reason: 'Refresh token reuse detected. Revoking all user sessions.',
                            user_agent: userAgent,
                            tokenId,
                        },
                    },
                });
                throw new common_1.UnauthorizedException('Deteksi penyalahgunaan token. Semua sesi dicabut demi alasan keamanan.');
            }
            const isSessionActive = await this.redisService.isSessionActive(userId, tokenId);
            if (!isSessionActive) {
                throw new common_1.UnauthorizedException('Sesi tidak aktif atau kedaluwarsa.');
            }
            const refreshExpirySec = 7 * 24 * 60 * 60;
            await this.redisService.markTokenAsUsed(tokenId, refreshExpirySec);
            await this.redisService.invalidateSession(userId, tokenId);
            return this.generateTokens(userId, tenantId, role, ip, userAgent);
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException) {
                throw err;
            }
            throw new common_1.UnauthorizedException('Refresh token tidak valid atau telah kedaluwarsa.');
        }
    }
    async logout(userId, tokenId, tenantId, ip) {
        await this.redisService.invalidateSession(userId, tokenId);
        await this.prisma.auditLog.create({
            data: {
                tenant_id: tenantId,
                user_id: userId,
                action: 'LOGOUT',
                resource: 'User',
                ip_address: ip,
            },
        });
        return { message: 'Berhasil keluar dari sesi.' };
    }
    async generateTokens(userId, tenantId, role, ip, userAgent) {
        const tokenId = (0, uuid_1.v4)();
        const accessPayload = { sub: userId, tenantId, role, jti: tokenId };
        const refreshPayload = { sub: userId, tenantId, role, jti: tokenId };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessPayload, {
                secret: process.env.JWT_SECRET || 'supersecretjwtkeythatisverylongandsecure123!',
                expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
            }),
            this.jwtService.signAsync(refreshPayload, {
                secret: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkeythatisverylongandsecure123!',
                expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
            }),
        ]);
        const ttlSeconds = 7 * 24 * 60 * 60;
        await this.redisService.saveSession(userId, tokenId, { ip, userAgent, loginAt: new Date().toISOString() }, ttlSeconds);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map