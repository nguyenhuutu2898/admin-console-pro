import React from 'react';
import { PageHeader } from './PageHeader';
import { SearchBar } from './SearchBar';
import { ActionButtons } from './ActionButtons';
import { DataTable } from './DataTable';
import { Pagination } from './Pagination';
import { cn } from '../../lib/utils';

interface PageLayoutProps {
  title: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  actionButtons: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Complete page layout component that combines header, search, actions, and content
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  searchPlaceholder = "Tìm kiếm...",
  searchValue,
  onSearchChange,
  actionButtons,
  children,
  className
}) => {
  return (
    <div className={cn("p-6", className)}>
      <PageHeader title={title} />
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
        />
        {actionButtons}
      </div>

      {children}
    </div>
  );
};

/**
 * Hook for managing page state (search, pagination, etc.)
 */
export interface UsePageStateOptions {
  initialSearch?: string;
  initialPage?: number;
  initialItemsPerPage?: number;
}

export interface UsePageStateReturn {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
}

export const usePageState = (options: UsePageStateOptions = {}): UsePageStateReturn => {
  const [searchTerm, setSearchTerm] = React.useState(options.initialSearch || '');
  const [currentPage, setCurrentPage] = React.useState(options.initialPage || 1);
  const [itemsPerPage, setItemsPerPage] = React.useState(options.initialItemsPerPage || 10);

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage
  };
};
