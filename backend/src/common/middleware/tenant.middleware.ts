import { Injectable, NestMiddleware, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';
import * as jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantDomain?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let resolvedTenantId: string | null = null;
    let resolvedTenantDomain: string | null = null;

    // 1. Resolve from JWT Token first if Authorization header is present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.tenantId) {
          resolvedTenantId = decoded.tenantId;
        }
      } catch (err) {
        // Skip JWT parse error here, let JwtAuthGuard handle token invalidity
      }
    }

    // 2. Resolve from Subdomain if not resolved yet
    const host = req.headers.host || '';
    // E.g., tenant1.whatsbiz.com or tenant1.localhost:3000
    const parts = host.split('.');
    if (!resolvedTenantId && parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'api' && parts[0] !== 'localhost') {
      resolvedTenantDomain = parts[0];
    }

    // 3. Resolve from custom request headers
    if (!resolvedTenantId && req.headers['x-tenant-id']) {
      resolvedTenantId = req.headers['x-tenant-id'] as string;
    }
    
    if (!resolvedTenantId && req.headers['x-tenant-domain']) {
      resolvedTenantDomain = req.headers['x-tenant-domain'] as string;
    }

    // 4. Resolve from Query parameters (fallback for public assets or webhooks)
    if (!resolvedTenantId && req.query.tenant_id) {
      resolvedTenantId = req.query.tenant_id as string;
    }

    // 5. Query Database to validate and get complete Tenant context
    let tenant = null;

    if (resolvedTenantId) {
      tenant = await this.prisma.tenant.findUnique({
        where: { id: resolvedTenantId },
      });
    } else if (resolvedTenantDomain) {
      tenant = await this.prisma.tenant.findFirst({
        where: { domain: resolvedTenantDomain },
      });
    }

    // Note: Some endpoints like /api/auth/register or public health checks don't need tenant validation
    // We inject tenant context if resolved, and check permissions inside modules or guards
    if (tenant) {
      if (!tenant.is_active) {
        throw new ForbiddenException('Akses tenant dinonaktifkan. Silakan hubungi admin.');
      }
      req.tenantId = tenant.id;
      req.tenantDomain = tenant.domain;
    }

    next();
  }
}
