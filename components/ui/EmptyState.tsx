import React from 'react';
import { Button } from './Button';
import { Plus } from '../Icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  canCreate?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Không có dữ liệu",
  description = "Chưa có dữ liệu nào được tìm thấy.",
  actionLabel = "Tạo mới",
  onAction,
  canCreate = false
}) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-6">
        {description}
      </p>
      
      {canCreate && onAction && (
        <Button onClick={onAction} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
