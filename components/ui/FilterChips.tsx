import React from 'react';
import { Badge } from './Badge';
import { X } from '../Icons';

interface FilterChipsProps {
  chips: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  onRemove: (key: string) => void;
  onClearAll?: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  onRemove,
  onClearAll
}) => {
  if (chips.length === 0) return null;

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
            {chip.label}: {chip.value}
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
