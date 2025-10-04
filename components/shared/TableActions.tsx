import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/DropdownMenu";
import { MoreVertical, Edit, Trash2, Key, Monitor } from "../Icons";
import { useAuth } from "../../hooks/useAuth";

interface TableActionsProps<T> {
  item: T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onResetPassword?: (item: T) => void;
  onConnect?: (item: T) => void;
  resource: string;
  targetBranchId?: string;
  customActions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (item: T) => void;
    condition?: (item: T) => boolean;
  }>;
}

export const TableActions = <T extends { id: string }>({
  item,
  onEdit,
  onDelete,
  onResetPassword,
  onConnect,
  resource,
  targetBranchId,
  customActions = []
}: TableActionsProps<T>) => {
  const { canEdit, canDelete, can } = useAuth();

  const canEditItem = canEdit(resource) && (!targetBranchId || can('edit', resource, targetBranchId));
  const canDeleteItem = canDelete(resource) && (!targetBranchId || can('delete', resource, targetBranchId));
  const canResetPassword = onResetPassword && can('reset-password', resource, targetBranchId);
  const canConnect = onConnect && can('connect-code', resource, targetBranchId);

  const hasActions = canEditItem || canDeleteItem || canResetPassword || canConnect || customActions.length > 0;

  if (!hasActions) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEditItem && onEdit && (
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </DropdownMenuItem>
        )}
        
        {canResetPassword && (
          <DropdownMenuItem onClick={() => onResetPassword(item)}>
            <Key className="w-4 h-4 mr-2" />
            Cấp mật khẩu mới
          </DropdownMenuItem>
        )}
        
        {canConnect && (
          <DropdownMenuItem onClick={() => onConnect(item)}>
            <Monitor className="w-4 h-4 mr-2" />
            Kết nối thiết bị
          </DropdownMenuItem>
        )}
        
        {customActions.map((action, index) => {
          if (action.condition && !action.condition(item)) return null;
          return (
            <DropdownMenuItem key={index} onClick={() => action.onClick(item)}>
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </DropdownMenuItem>
          );
        })}
        
        {canDeleteItem && onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(item)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
