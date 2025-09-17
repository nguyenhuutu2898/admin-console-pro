import React from 'react';

import { Select, SelectItem } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { UserRole } from '../../types';

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.STAFF]: 'Staff',
  [UserRole.VIEWER]: 'Viewer',
};

const roleBadgeVariant: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  [UserRole.ADMIN]: 'default',
  [UserRole.STAFF]: 'secondary',
  [UserRole.VIEWER]: 'outline',
};

interface UserRoleSelectProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export const UserRoleSelect: React.FC<UserRoleSelectProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-3">
      <Badge variant={roleBadgeVariant[value]}>{roleLabels[value]}</Badge>
      <Select
        value={value}
        onChange={event => onChange(event.target.value as UserRole)}
        disabled={disabled}
        className="max-w-[140px]"
      >
        {Object.values(UserRole).map(role => (
          <SelectItem key={role} value={role}>
            {roleLabels[role]}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};
