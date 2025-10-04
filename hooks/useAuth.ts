import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

export const useAuth = () => {
  const { user } = useAuthStore();

  const can = (action: string, resource: string, targetBranchId?: string): boolean => {
    if (!user) return false;

    // SUPER_ADMIN has all permissions
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // BRANCH_ADMIN permissions
    if (user.role === UserRole.BRANCH_ADMIN) {
      switch (resource) {
        case 'branches':
          // Can only view/list branches, not create/edit/delete
          return action === 'view' || action === 'list';
        case 'users':
          // Can manage users in their branch only
          if (targetBranchId && targetBranchId !== user.branchId) return false;
          return ['view', 'list', 'create', 'edit', 'delete', 'reset-password'].includes(action);
        case 'kiosks':
          // Can manage kiosks in their branch only
          if (targetBranchId && targetBranchId !== user.branchId) return false;
          return ['view', 'list', 'create', 'edit', 'delete', 'connect-code'].includes(action);
        case 'ads':
          // Can manage ads in their branch only
          if (targetBranchId && targetBranchId !== user.branchId) return false;
          return ['view', 'list', 'create', 'edit', 'delete'].includes(action);
        case 'transaction-types':
          // Can only view transaction types
          return action === 'view' || action === 'list';
        case 'settings':
          // Can only view settings, not edit
          return action === 'view';
        default:
          return false;
      }
    }

    // STAFF permissions (minimal)
    if (user.role === UserRole.STAFF) {
      return action === 'view' || action === 'list';
    }

    return false;
  };

  const canCreate = (resource: string): boolean => {
    return can('create', resource);
  };

  const canEdit = (resource: string): boolean => {
    return can('edit', resource);
  };

  const canDelete = (resource: string): boolean => {
    return can('delete', resource);
  };

  const canView = (resource: string): boolean => {
    return can('view', resource);
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === UserRole.SUPER_ADMIN;
  };

  const isBranchAdmin = (): boolean => {
    return user?.role === UserRole.BRANCH_ADMIN;
  };

  const isStaff = (): boolean => {
    return user?.role === UserRole.STAFF;
  };

  return {
    user,
    can,
    canCreate,
    canEdit,
    canDelete,
    canView,
    isSuperAdmin,
    isBranchAdmin,
    isStaff,
  };
};
