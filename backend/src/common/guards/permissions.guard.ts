import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

// Map UserRole to static list of permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    'customer.read', 'customer.write', 'order.manage', 'invoice.manage', 
    'message.send', 'team.manage', 'tenant.manage'
  ],
  OWNER: [
    'customer.read', 'customer.write', 'order.manage', 'invoice.manage', 
    'message.send', 'team.manage', 'tenant.manage'
  ],
  MANAGER: [
    'customer.read', 'customer.write', 'order.manage', 'invoice.manage', 
    'message.send', 'team.manage'
  ],
  STAFF: [
    'customer.read', 'message.send'
  ],
  SALES: [
    'customer.read', 'customer.write', 'order.manage', 'message.send'
  ],
  FINANCE: [
    'customer.read', 'order.manage', 'invoice.manage'
  ],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no specific permissions are required, let it pass
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false;
    }

    const userRole = user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    // Verify if user possesses all of the required permissions for the route
    const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));
    
    if (!hasAllPermissions) {
      throw new ForbiddenException('Akses ditolak: Anda tidak memiliki izin yang diperlukan untuk aksi ini.');
    }

    return true;
  }
}
