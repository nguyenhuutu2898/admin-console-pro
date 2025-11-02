import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { FloatingInput, FloatingSelect } from '../../components/ui';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { PaginationFooter } from '../../components/ui/PaginationFooter';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { MoreVertical, Edit, Filter, Receipt, RotateCcw } from '../../components/Icons';
import { transactionTypesApi } from '../../services/transactionTypes';
import { useAuth } from '../../hooks/useAuth';
import { TransactionType } from '../../types';

const TransactionTypesPage: React.FC = () => {
  const { canEdit } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransactionType, setEditingTransactionType] = useState<TransactionType | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Fetch transaction types
  const { data: transactionTypesData, isLoading, error } = useQuery({
    queryKey: ['transaction-types', page, limit, search],
    queryFn: () => transactionTypesApi.getTransactionTypes({
      page,
      limit,
      q: search,
    }),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionType> }) =>
      transactionTypesApi.updateTransactionType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-types'] });
      setShowEditModal(false);
      setEditingTransactionType(null);
      resetForm();
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      status: 'active',
    });
  };

  const handleEdit = (transactionType: TransactionType) => {
    setEditingTransactionType(transactionType);
    setFormData({
      code: transactionType.code,
      name: transactionType.name,
      description: transactionType.description || '',
      status: transactionType.status || 'active',
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingTransactionType || !formData.code || !formData.name) return;
    updateMutation.mutate({
      id: editingTransactionType.id,
      data: formData
    });
  };

  const handleApplyFilters = (newFilters: Record<string, string>) => {
    // For transaction types, we only have status filter
    setPage(1);
  };

  const handleRemoveFilter = (key: string) => {
    setPage(1);
  };

  const handleClearFilters = () => {
    setPage(1);
  };

  // Filter fields for FilterSheet (minimal for transaction types)
  const filterFields = [
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Không hoạt động' },
      ],
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-gray-500 mb-4">Không thể tải danh sách loại giao dịch</p>
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Loại giao dịch</h1>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col lg:flex-row gap-2 items-start lg:items-center">
        <div className="w-full lg:w-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Mã giao dịch/Tên giao dịch"
            label="Tìm kiếm"
            width="w-full lg:w-80"
            height="h-10"
            isFilter={true}
          />
        </div>
        
        <div className="flex flex-1 items-center gap-2 w-full lg:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setSearch('')}
            disabled={!search}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Mã giao dịch</TableHead>
              <TableHead className="font-semibold text-gray-900">Tên giao dịch</TableHead>
              <TableHead className="font-semibold text-gray-900">Mô tả</TableHead>
              <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-900 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <LoadingSkeleton rows={5} columns={5} />
                </TableCell>
              </TableRow>
            ) : transactionTypesData?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    title="Không có loại giao dịch nào"
                    description="Chưa có loại giao dịch nào được tìm thấy."
                  />
                </TableCell>
              </TableRow>
            ) : (
              transactionTypesData?.items.map((transactionType) => (
                <TableRow 
                  key={transactionType.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onDoubleClick={() => canEdit('transaction-types') && handleEdit(transactionType)}
                >
                  <TableCell>
                    <div className="font-medium">{transactionType.code}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{transactionType.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {transactionType.description || 'Không có mô tả'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transactionType.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transactionType.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </TableCell>
                  <TableCell className="w-[50px]">
                    {canEdit('transaction-types') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit('transaction-types') && (
                            <DropdownMenuItem onClick={() => handleEdit(transactionType)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {transactionTypesData && transactionTypesData.total > 0 && (
        <PaginationFooter
          total={transactionTypesData.total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          isLoading={isLoading}
        />
      )}

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApply={handleApplyFilters}
        onReset={handleClearFilters}
        title="Lọc dữ liệu"
        fields={filterFields}
        appliedFilters={{}}
      />

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin loại giao dịch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <FloatingInput
                id="code"
                label="Mã giao dịch"
                required={true}
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <div>
              <FloatingInput
                id="name"
                label="Tên giao dịch"
                required={true}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <FloatingInput
                id="description"
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <FloatingSelect
                label="Trạng thái"
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
                options={[
                  { value: "active", label: "Hoạt động" },
                  { value: "inactive", label: "Không hoạt động" }
                ]}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionTypesPage;