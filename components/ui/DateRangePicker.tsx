import React from 'react';
import { Calendar, X } from '../Icons';
import { Input } from './Input';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear?: () => void;
  className?: string;
  placeholder?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  className,
  placeholder = "Chọn khoảng thời gian"
}) => {
  const hasValue = startDate || endDate;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {placeholder}
        </span>
        {hasValue && onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Từ ngày
          </label>
          <Input
            type="date"
            value={startDate || ''}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Đến ngày
          </label>
          <Input
            type="date"
            value={endDate || ''}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="text-sm"
            min={startDate}
          />
        </div>
      </div>
      
      {hasValue && (
        <div className="text-xs text-gray-500">
          {startDate && endDate 
            ? `${startDate} - ${endDate}`
            : startDate 
            ? `Từ ${startDate}`
            : `Đến ${endDate}`
          }
        </div>
      )}
    </div>
  );
};
