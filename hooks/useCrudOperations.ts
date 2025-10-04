import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CrudApi<T, CreateData, UpdateData, Filter = {}> {
  getItems: (params: { page: number; limit: number; q?: string } & Filter) => Promise<{ data: T[]; total: number; page: number; limit: number }>;
  createItem: (data: CreateData) => Promise<T>;
  updateItem: (id: string, data: UpdateData) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;
}

interface UseCrudOperationsOptions<T, CreateData, UpdateData, Filter> {
  api: CrudApi<T, CreateData, UpdateData, Filter>;
  queryKey: string;
  page: number;
  limit: number;
  search: string;
  filters: Filter;
  onSuccess?: {
    create?: (data: T) => void;
    update?: (data: T) => void;
    delete?: (id: string) => void;
  };
}

interface UseCrudOperationsReturn<T, CreateData, UpdateData> {
  // Data
  data: T[] | undefined;
  total: number;
  isLoading: boolean;
  error: Error | null;
  
  // Mutations
  createMutation: ReturnType<typeof useMutation<T, Error, CreateData>>;
  updateMutation: ReturnType<typeof useMutation<T, Error, { id: string; data: UpdateData }>>;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
  
  // Actions
  handleCreate: (data: CreateData) => void;
  handleUpdate: (id: string, data: UpdateData) => void;
  handleDelete: (id: string) => void;
  
  // State
  editingItem: T | null;
  deletingItem: T | null;
  setEditingItem: (item: T | null) => void;
  setDeletingItem: (item: T | null) => void;
}

export const useCrudOperations = <T extends { id: string }, CreateData, UpdateData, Filter = {}>(
  options: UseCrudOperationsOptions<T, CreateData, UpdateData, Filter>
): UseCrudOperationsReturn<T, CreateData, UpdateData> => {
  const { api, queryKey, page, limit, search, filters, onSuccess } = options;
  const queryClient = useQueryClient();

  // State for editing/deleting items
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  // Fetch data
  const { data: response, isLoading, error } = useQuery({
    queryKey: [queryKey, page, limit, search, filters],
    queryFn: () => api.getItems({ page, limit, q: search, ...filters }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: api.createItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success('Tạo mới thành công');
      onSuccess?.create?.(data);
    },
    onError: (error) => {
      toast.error(`Lỗi tạo mới: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateData }) => api.updateItem(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success('Cập nhật thành công');
      setEditingItem(null);
      onSuccess?.update?.(data);
    },
    onError: (error) => {
      toast.error(`Lỗi cập nhật: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteItem,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success('Xóa thành công');
      setDeletingItem(null);
      onSuccess?.delete?.(id);
    },
    onError: (error) => {
      toast.error(`Lỗi xóa: ${error.message}`);
    },
  });

  // Action handlers
  const handleCreate = useCallback((data: CreateData) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const handleUpdate = useCallback((id: string, data: UpdateData) => {
    updateMutation.mutate({ id, data });
  }, [updateMutation]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  return {
    // Data
    data: response?.data,
    total: response?.total || 0,
    isLoading,
    error,
    
    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,
    
    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    
    // State
    editingItem,
    deletingItem,
    setEditingItem,
    setDeletingItem,
  };
};
