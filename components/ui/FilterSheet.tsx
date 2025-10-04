import React from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { X } from '../Icons';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: FilterOption[];
}

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string>) => void;
  onReset: () => void;
  title: string;
  fields: FilterField[];
  appliedFilters: Record<string, string>;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  title,
  fields,
  appliedFilters
}) => {
  const [filters, setFilters] = React.useState<Record<string, string>>(appliedFilters);

  React.useEffect(() => {
    setFilters(appliedFilters);
  }, [appliedFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters = fields.reduce((acc, field) => {
      acc[field.key] = '';
      return acc;
    }, {} as Record<string, string>);
    
    setFilters(emptyFilters);
    onReset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                  </label>
                  
                  {field.type === 'text' && (
                    <Input
                      value={filters[field.key] || ''}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                      placeholder={`Nhập ${field.label.toLowerCase()}`}
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <Select
                      value={filters[field.key] || ''}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )}
                  
                  {field.type === 'date' && (
                    <Input
                      type="date"
                      value={filters[field.key] || ''}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1"
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
