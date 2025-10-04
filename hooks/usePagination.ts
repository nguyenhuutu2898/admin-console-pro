import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  search: string;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  resetPagination: () => void;
  resetSearch: () => void;
  resetAll: () => void;
}

export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSearch = ''
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);

  const resetPagination = useCallback(() => {
    setPage(1);
    setLimit(10);
  }, []);

  const resetSearch = useCallback(() => {
    setSearch('');
    setPage(1);
  }, []);

  const resetAll = useCallback(() => {
    setPage(1);
    setLimit(10);
    setSearch('');
  }, []);

  return {
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    resetPagination,
    resetSearch,
    resetAll
  };
};
