import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { FilterChips } from '../../components/ui/FilterChips';
import { PaginationFooter } from '../../components/ui/PaginationFooter';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MoreVertical, Edit, Trash2, Plus, Filter } from '../../components/Icons';
import { branchesApi } from '../../services/branches';
import { useAuth } from '../../hooks/useAuth';
import { Branch, LocationFilter } from '../../types';

const BranchesPage: React.FC = () => {
  const { canCreate, canEdit, canDelete } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<LocationFilter>({});
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    province: '',
    district: '',
    ward: '',
    address: '',
  });

  // Fetch branches
  const { data: branchesData, isLoading, error } = useQuery({
    queryKey: ['branches', page, limit, search, filters],
    queryFn: () => branchesApi.getBranches({
      page,
      limit,
      q: search,
      ...filters
    }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: branchesApi.createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Branch> }) =>
      branchesApi.updateBranch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setShowEditModal(false);
      setEditingBranch(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: branchesApi.deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setShowDeleteConfirm(false);
      setDeletingBranch(null);
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      province: '',
      district: '',
      ward: '',
      address: '',
    });
  };

  const handleCreate = () => {
    if (!formData.code || !formData.name) return;
    createMutation.mutate(formData);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      code: branch.code,
      name: branch.name,
      province: branch.province || '',
      district: branch.district || '',
      ward: branch.ward || '',
      address: branch.address || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingBranch || !formData.code || !formData.name) return;
    updateMutation.mutate({
      id: editingBranch.id,
      data: formData
    });
  };

  const handleDelete = (branch: Branch) => {
    setDeletingBranch(branch);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingBranch) {
      deleteMutation.mutate(deletingBranch.id);
    }
  };

  const handleApplyFilters = (newFilters: Record<string, string>) => {
    setFilters(newFilters as LocationFilter);
    setPage(1);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof LocationFilter];
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Filter chips
  const filterChips = Object.entries(filters)
    .filter(([_, value]) => value)
    .map(([key, value]) => ({
      key,
      label: key === 'province' ? 'Tỉnh/Thành phố' :
             key === 'district' ? 'Quận/Huyện' :
             key === 'ward' ? 'Phường/Xã' : key,
      value
    }));

  // Filter fields for FilterSheet
  const filterFields = [
    {
      key: 'province',
      label: 'Tỉnh/Thành phố',
      type: 'text' as const,
    },
    {
      key: 'district',
      label: 'Quận/Huyện',
      type: 'text' as const,
    },
    {
      key: 'ward',
      label: 'Phường/Xã',
      type: 'text' as const,
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-gray-500 mb-4">Không thể tải danh sách chi nhánh</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Danh sách chi nhánh</h1>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Mã/Tên chi nhánh"
        />
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowFilterSheet(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Lọc dữ liệu
          </Button>
          
          {canCreate('branches') && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm chi nhánh
            </Button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <FilterChips
        chips={filterChips}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearFilters}
      />

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Mã chi nhánh</TableHead>
              <TableHead className="font-semibold text-gray-900">Tên chi nhánh</TableHead>
              <TableHead className="font-semibold text-gray-900">Địa chỉ</TableHead>
              <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-900">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <LoadingSkeleton rows={5} columns={5} />
                </TableCell>
              </TableRow>
            ) : branchesData?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    title="Không có chi nhánh nào"
                    description="Chưa có chi nhánh nào được tìm thấy."
                    actionLabel="Thêm chi nhánh"
                    onAction={() => setShowCreateModal(true)}
                    canCreate={canCreate('branches')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              branchesData?.items.map((branch) => (
                <TableRow 
                  key={branch.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onDoubleClick={() => canEdit('branches') && handleEdit(branch)}
                >
                  <TableCell>
                    <div className="font-medium">{branch.code}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{branch.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {[branch.ward, branch.district, branch.province]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      branch.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {branch.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEdit('branches') && (
                          <DropdownMenuItem onClick={() => handleEdit(branch)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        )}
                        {canDelete('branches') && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(branch)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa chi nhánh
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {branchesData && branchesData.total > 0 && (
        <PaginationFooter
          total={branchesData.total}
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
        appliedFilters={filters}
      />

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo chi nhánh</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Mã chi nhánh *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Nhập mã chi nhánh"
              />
            </div>
            <div>
              <Label htmlFor="name">Tên chi nhánh *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên chi nhánh"
              />
            </div>
            <div>
              <Label htmlFor="province">Tỉnh/Thành phố</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                placeholder="Nhập tỉnh/thành phố"
              />
            </div>
            <div>
              <Label htmlFor="district">Quận/Huyện</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                placeholder="Nhập quận/huyện"
              />
            </div>
            <div>
              <Label htmlFor="ward">Phường/Xã</Label>
              <Input
                id="ward"
                value={formData.ward}
                onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                placeholder="Nhập phường/xã"
              />
            </div>
            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Nhập địa chỉ"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo mới'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin chi nhánh</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Mã chi nhánh *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Nhập mã chi nhánh"
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Tên chi nhánh *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên chi nhánh"
              />
            </div>
            <div>
              <Label htmlFor="edit-province">Tỉnh/Thành phố</Label>
              <Input
                id="edit-province"
                value={formData.province}
                onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                placeholder="Nhập tỉnh/thành phố"
              />
            </div>
            <div>
              <Label htmlFor="edit-district">Quận/Huyện</Label>
              <Input
                id="edit-district"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                placeholder="Nhập quận/huyện"
              />
            </div>
            <div>
              <Label htmlFor="edit-ward">Phường/Xã</Label>
              <Input
                id="edit-ward"
                value={formData.ward}
                onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                placeholder="Nhập phường/xã"
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Địa chỉ</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Nhập địa chỉ"
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa chi nhánh "${deletingBranch?.name}" này không?`}
        confirmText="Đồng ý"
        cancelText="Không"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default BranchesPage;