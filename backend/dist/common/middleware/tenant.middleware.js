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
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const jwt = require("jsonwebtoken");
let TenantMiddleware = class TenantMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, res, next) {
        let resolvedTenantId = null;
        let resolvedTenantDomain = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.decode(token);
                if (decoded && decoded.tenantId) {
                    resolvedTenantId = decoded.tenantId;
                }
            }
            catch (err) {
            }
        }
        const host = req.headers.host || '';
        const parts = host.split('.');
        if (!resolvedTenantId && parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'api' && parts[0] !== 'localhost') {
            resolvedTenantDomain = parts[0];
        }
        if (!resolvedTenantId && req.headers['x-tenant-id']) {
            resolvedTenantId = req.headers['x-tenant-id'];
        }
        if (!resolvedTenantId && req.headers['x-tenant-domain']) {
            resolvedTenantDomain = req.headers['x-tenant-domain'];
        }
        if (!resolvedTenantId && req.query.tenant_id) {
            resolvedTenantId = req.query.tenant_id;
        }
        let tenant = null;
        if (resolvedTenantId) {
            tenant = await this.prisma.tenant.findUnique({
                where: { id: resolvedTenantId },
            });
        }
        else if (resolvedTenantDomain) {
            tenant = await this.prisma.tenant.findFirst({
                where: { domain: resolvedTenantDomain },
            });
        }
        if (tenant) {
            if (!tenant.is_active) {
                throw new common_1.ForbiddenException('Akses tenant dinonaktifkan. Silakan hubungi admin.');
            }
            req.tenantId = tenant.id;
            req.tenantDomain = tenant.domain;
        }
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map