import * as React from "react";
import { Button } from "../ui/Button";
import { SearchBar } from "../ui/SearchBar";
import { FilterChips } from "../ui/FilterChips";
import { PaginationFooter } from "../ui/PaginationFooter";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { ErrorBanner } from "../ui/ErrorBanner";
import { Plus, Filter } from "../Icons";
import { useAuth } from "../../hooks/useAuth";

interface PageLayoutProps<T> {
  // Data
  data: T[] | undefined;
  total: number;
  isLoading: boolean;
  error: Error | null;
  
  // Pagination & Search
  page: number;
  limit: number;
  search: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearchChange: (search: string) => void;
  
  // Filters
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
  
  // Actions
  onCreateClick: () => void;
  onFilterClick: () => void;
  
  // Content
  title: string;
  createButtonText: string;
  resource: string;
  children: React.ReactNode;
  
  // Optional
  showCreateButton?: boolean;
  showFilterButton?: boolean;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
}

export const PageLayout = <T extends { id: string }>({
  data,
  total,
  isLoading,
  error,
  page,
  limit,
  search,
  onPageChange,
  onLimitChange,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  onCreateClick,
  onFilterClick,
  title,
  createButtonText,
  resource,
  children,
  showCreateButton = true,
  showFilterButton = true,
  emptyStateMessage = "Không có dữ liệu",
  emptyStateAction
}: PageLayoutProps<T>) => {
  const { canCreate } = useAuth();
  
  const canShowCreateButton = showCreateButton && canCreate(resource);
  const hasActiveFilters = Object.keys(filters).length > 0;

  if (error) {
    return (
      <div className="p-6">
        <ErrorBanner 
          message={`Lỗi tải dữ liệu: ${error.message}`}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {canShowCreateButton && (
          <Button onClick={onCreateClick} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {createButtonText}
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder="Tìm kiếm..."
          />
        </div>
        {showFilterButton && (
          <Button
            variant="outline"
            onClick={onFilterClick}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Lọc dữ liệu
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <FilterChips
          chips={Object.entries(filters).map(([key, value]) => ({
            key,
            label: key,
            value: String(value),
            onRemove: () => onFilterChange({ ...filters, [key]: undefined })
          }))}
        />
      )}

      {/* Content */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <LoadingSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState
            message={emptyStateMessage}
            action={emptyStateAction}
          />
        ) : (
          children
        )}
      </div>

      {/* Pagination */}
      {data && data.length > 0 && (
        <PaginationFooter
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          pageSize={limit}
          totalItems={total}
          onPageChange={onPageChange}
          onPageSizeChange={onLimitChange}
        />
      )}
    </div>
  );
};
