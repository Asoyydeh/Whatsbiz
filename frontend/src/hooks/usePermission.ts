import { useAuthStore } from '@/store/useAuthStore';

// Exact duplicate of backend role permission mapping for UI consistency
const ROLE_PERMISSIONS: Record<string, string[]> = {
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

export function usePermission() {
  const { user } = useAuthStore();
  const role = user?.role || '';

  const hasPermission = (permission: string): boolean => {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((perm) => hasPermission(perm));
  };

  return {
    role,
    isOwner: role === 'OWNER',
    isManager: role === 'MANAGER',
    isStaff: role === 'STAFF',
    isSales: role === 'SALES',
    isFinance: role === 'FINANCE',
    hasPermission,
    hasAnyPermission,
  };
}
