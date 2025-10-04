import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

export const useAuth = () => {
  const { user } = useAuthStore();

  const can = (action: string, resource: string): boolean => {
    if (!user) return false;

    // SUPER_ADMIN has all permissions
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // BRANCH_ADMIN permissions
    if (user.role === UserRole.BRANCH_ADMIN) {
      switch (resource) {
        case 'branches':
          return action === 'view' || action === 'list';
        case 'users':
          return ['view', 'list', 'create', 'edit', 'delete', 'reset-password'].includes(action);
        case 'kiosks':
          return ['view', 'list', 'create', 'edit', 'delete', 'connect-code'].includes(action);
        case 'ads':
          return ['view', 'list', 'create', 'edit', 'delete'].includes(action);
        case 'transaction-types':
          return action === 'view' || action === 'list';
        case 'settings':
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
