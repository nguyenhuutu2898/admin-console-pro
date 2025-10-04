import React from 'react';
import { Badge } from './Badge';
import { X } from '../Icons';
import { getProvinceName, getDistrictName, getWardName } from '../../lib/location-data';

interface FilterChip {
  key: string;
  label: string;
  value: string;
  type?: 'location' | 'date' | 'status' | 'role' | 'branch' | 'default';
}

interface FilterChipsProps {
  chips: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll?: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  onRemove,
  onClearAll
}) => {
  if (chips.length === 0) return null;

  const formatChipValue = (chip: FilterChip): string => {
    switch (chip.type) {
      case 'location':
        // Handle location chips (province, district, ward)
        if (chip.key === 'province') {
          return getProvinceName(chip.value);
        } else if (chip.key === 'district') {
          // For district, we need to get the province from another chip
          const provinceChip = chips.find(c => c.key === 'province');
          if (provinceChip) {
            return getDistrictName(provinceChip.value, chip.value);
          }
          return chip.value;
        } else if (chip.key === 'ward') {
          // For ward, we need to get province and district from other chips
          const provinceChip = chips.find(c => c.key === 'province');
          const districtChip = chips.find(c => c.key === 'district');
          if (provinceChip && districtChip) {
            return getWardName(provinceChip.value, districtChip.value, chip.value);
          }
          return chip.value;
        }
        return chip.value;
        
      case 'date':
        // Handle date range chips
        if (chip.key === 'startDate' || chip.key === 'endDate') {
          return new Date(chip.value).toLocaleDateString('vi-VN');
        }
        return chip.value;
        
      case 'status':
        // Handle status chips
        const statusMap: Record<string, string> = {
          'active': 'Hoạt động',
          'inactive': 'Không hoạt động',
          'connected': 'Đã kết nối',
          'disconnected': 'Mất kết nối',
          'draft': 'Bản nháp',
          'scheduled': 'Đã lên lịch',
          'running': 'Đang chạy',
          'paused': 'Tạm dừng',
          'ended': 'Đã kết thúc'
        };
        return statusMap[chip.value] || chip.value;
        
      case 'role':
        // Handle role chips
        const roleMap: Record<string, string> = {
          'SUPER_ADMIN': 'Quản trị viên',
          'BRANCH_ADMIN': 'Quản trị chi nhánh',
          'STAFF': 'Nhân viên'
        };
        return roleMap[chip.value] || chip.value;
        
      default:
        return chip.value;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-600">Bộ lọc:</span>
      
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="flex items-center gap-1 px-2 py-1"
        >
          <span className="text-xs">
            {chip.label}: {formatChipValue(chip)}
          </span>
          <button
            onClick={() => onRemove(chip.key)}
            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      {onClearAll && (
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  );
};
