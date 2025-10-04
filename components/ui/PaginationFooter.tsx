import React from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface PaginationFooterProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

export const PaginationFooter: React.FC<PaginationFooterProps> = ({
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  isLoading = false
}) => {
  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const handlePageInputChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      const newPage = parseInt(target.value);
      
      if (newPage >= 1 && newPage <= totalPages) {
        onPageChange(newPage);
      }
    }
  };

  const handlePageInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newPage = parseInt(e.target.value);
    
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    } else {
      e.target.value = page.toString();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Items info */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Hiển thị {startItem}-{endItem} trong {total} kết quả
        </span>
        
        <select 
          value={limit} 
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
          disabled={isLoading}
        >
          <option value={10}>10/trang</option>
          <option value={20}>20/trang</option>
          <option value={50}>50/trang</option>
          <option value={100}>100/trang</option>
        </select>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || isLoading}
        >
          ←
        </Button>
        
        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <Button
              key={pageNum}
              variant={page === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={page === pageNum ? "bg-blue-600 text-white" : ""}
              disabled={isLoading}
            >
              {pageNum}
            </Button>
          );
        })}
        
        {/* Ellipsis and last page */}
        {totalPages > 5 && (
          <>
            <span className="px-2">...</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={isLoading}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || isLoading}
        >
          →
        </Button>
      </div>

      {/* Jump to page */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Trang</span>
        <Input
          type="number"
          min="1"
          max={totalPages}
          defaultValue={page}
          onKeyPress={handlePageInputChange}
          onBlur={handlePageInputBlur}
          className="w-16 h-8 text-center"
          disabled={isLoading}
        />
        <span className="text-sm text-gray-700">/ {totalPages}</span>
      </div>
    </div>
  );
};
