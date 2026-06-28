import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resolvedTenantId = request.tenantId;

    // If the route is not protected by JWT, let it pass (or handle public routes separately)
    if (!user) {
      return true;
    }

    // In a multi-tenant SaaS, the user's tenantId must match the resolved tenantId from the request context
    if (resolvedTenantId && user.tenantId !== resolvedTenantId) {
      throw new ForbiddenException('Akses ditolak: Anda tidak memiliki izin untuk mengakses data tenant lain.');
    }

    return true;
  }
}
