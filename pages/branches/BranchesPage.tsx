import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { FloatingInput, FloatingSelect } from '../../components/ui';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { CascadingLocationSelect } from '../../components/ui/CascadingLocationSelect';
import { PaginationFooter } from '../../components/ui/PaginationFooter';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MoreVertical, Edit, Trash2, Plus, Filter, RotateCcw } from '../../components/Icons';
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
    coreCode: '',
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
      coreCode: '',
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
      coreCode: branch.coreCode || branch.code,
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
    setSearch('');
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
      value,
      type: key === 'province' || key === 'district' || key === 'ward' ? 'location' : 'default'
    }));

  // Filter fields for FilterSheet
  const filterFields = [
    {
      key: 'location',
      label: 'Địa điểm',
      type: 'custom' as const,
      component: (
        <CascadingLocationSelect
          province={filters.province}
          district={filters.district}
          ward={filters.ward}
          onProvinceChange={(value) => setFilters(prev => ({ ...prev, province: value }))}
          onDistrictChange={(value) => setFilters(prev => ({ ...prev, district: value }))}
          onWardChange={(value) => setFilters(prev => ({ ...prev, ward: value }))}
          onClear={() => setFilters(prev => ({ ...prev, province: '', district: '', ward: '' }))}
        />
      )
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

      {/* Search, Filter and Actions */}
      <div className="mb-6 flex flex-col lg:flex-row gap-2 items-start lg:items-center">
        <div className="w-full lg:w-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Mã/Tên chi nhánh"
            label="Tìm kiếm"
            width="w-full lg:w-80"
            height="h-10"
            isFilter={true}
          />
        </div>
        
        <div className="flex flex-1 items-center gap-2 w-full lg:w-auto">
          <CascadingLocationSelect
            province={filters.province}
            district={filters.district}
            ward={filters.ward}
            onProvinceChange={(value) => setFilters(prev => ({ ...prev, province: value, district: '', ward: '' }))}
            onDistrictChange={(value) => setFilters(prev => ({ ...prev, district: value, ward: '' }))}
            onWardChange={(value) => setFilters(prev => ({ ...prev, ward: value }))}
            onClear={() => setFilters(prev => ({ ...prev, province: '', district: '', ward: '' }))}
            width="w-auto"
            height="h-10"
            selectWidth="w-[170px]"
            isFilter={true}
          />
          
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            disabled={!Object.keys(filters).some(key => filters[key as keyof LocationFilter]) && !search}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
          
          {canCreate('branches') && (
            <Button className="ml-auto" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm chi nhánh
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Mã CN</TableHead>
              <TableHead className="font-semibold text-gray-900">Mã CN gốc</TableHead>
              <TableHead className="font-semibold text-gray-900">Tên tỉnh thành</TableHead>
              <TableHead className="font-semibold text-gray-900">Ngày cập nhật</TableHead>
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
                    <div className="font-medium">{branch.coreCode || branch.code}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">{branch.province}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {branch.updatedAt ? new Date(branch.updatedAt).toLocaleDateString('vi-VN') : '-'}
                    </div>
                  </TableCell>
                  <TableCell className="w-[50px]">
                    {(canEdit('branches') || canDelete('branches')) && (
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
                    )}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin chi nhánh</DialogTitle>
            <p className="text-sm text-gray-600">Điền thông tin cho chi nhánh</p>
          </DialogHeader>
          <div className="space-y-6">
            {/* Row 1: Mã chi nhánh và Mã chi nhánh trên core */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FloatingInput
                  id="branch-code"
                  label="Mã chi nhánh"
                  infoIcon={true}
                  required={true}
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>
              <div>
                <FloatingInput
                  id="core-code"
                  label="Mã CN gốc"
                  infoIcon={true}
                  required={true}
                  value={formData.coreCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, coreCode: e.target.value }))}
                />
              </div>
            </div>

            {/* Row 2: Tên chi nhánh */}
            <div>
              <FloatingInput
                id="branch-name"
                label="Tên chi nhánh"
                infoIcon={true}
                required={true}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Row 3: Địa chỉ */}
            <div>
              <FloatingInput
                id="branch-address"
                label="Địa chỉ (Ví dụ: 102 Lạc Long Quân)"
                infoIcon={true}
                required={true}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            {/* Row 4: Tỉnh/Thành phố, Quận/Huyện, Phường/Xã */}
            <div className="grid grid-cols-3 gap-4">
            <div>
                <FloatingSelect
                  label="Tỉnh/Thành Phố"
                  required={true}
                  value={formData.province}
                  onChange={(value) => setFormData(prev => ({ ...prev, province: value }))}
                  options={[
                    { value: "HN", label: "Hà Nội" },
                    { value: "HCM", label: "TP. Hồ Chí Minh" },
                    { value: "DN", label: "Đà Nẵng" },
                    { value: "CT", label: "Cần Thơ" }
                  ]}
              />
            </div>
            <div>
                <FloatingSelect
                  label="Quận/ Huyện"
                  required={true}
                  value={formData.district}
                  onChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                  options={[
                    { value: "NK", label: "Quận Ninh Kiều" },
                    { value: "BD", label: "Quận Ba Đình" },
                    { value: "Q1", label: "Quận 1" }
                  ]}
              />
            </div>
            <div>
                <FloatingSelect
                  label="Phường/ Xã"
                  required={true}
                  value={formData.ward}
                  onChange={(value) => setFormData(prev => ({ ...prev, ward: value }))}
                  options={[
                    { value: "AH", label: "Phường An Hoà" },
                    { value: "PX", label: "Phường Phúc Xá" },
                    { value: "BN", label: "Phường Bến Nghé" }
                  ]}
              />
            </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo mới'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin chi nhánh</DialogTitle>
            <p className="text-sm text-gray-600">Điền thông tin cho chi nhánh</p>
          </DialogHeader>
          <div className="space-y-4">
            {/* Row 1: Mã chi nhánh, Mã CN gốc */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FloatingInput
                  id="edit-code"
                  label="Mã chi nhánh"
                  infoIcon={true}
                  required={true}
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>
              <div>
                <FloatingInput
                  id="edit-core-code"
                  label="Mã CN gốc"
                  infoIcon={true}
                  required={true}
                  value={formData.coreCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, coreCode: e.target.value }))}
                />
              </div>
            </div>
            {/* Row 2: Tên chi nhánh */}
            <div>
              <FloatingInput
                id="edit-name"
                label="Tên chi nhánh"
                infoIcon={true}
                required={true}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            {/* Row 2: Địa chỉ */}
            <div>
              <FloatingInput
                id="edit-address"
                label="Địa chỉ (Ví dụ: 102 Lạc Long Quân)"
                infoIcon={true}
                required={true}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            {/* Row 3: Tỉnh/Thành phố, Quận/Huyện, Phường/Xã */}
            <div className="grid grid-cols-3 gap-4">
            <div>
                <FloatingSelect
                  label="Tỉnh/Thành Phố"
                  required={true}
                  value={formData.province}
                  onChange={(value) => setFormData(prev => ({ ...prev, province: value }))}
                  options={[
                    { value: "HN", label: "Hà Nội" },
                    { value: "HCM", label: "TP. Hồ Chí Minh" },
                    { value: "DN", label: "Đà Nẵng" },
                    { value: "CT", label: "Cần Thơ" }
                  ]}
              />
            </div>
            <div>
                <FloatingSelect
                  label="Quận/ Huyện"
                  required={true}
                  value={formData.district}
                  onChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                  options={[
                    { value: "NK", label: "Quận Ninh Kiều" },
                    { value: "BD", label: "Quận Ba Đình" },
                    { value: "Q1", label: "Quận 1" }
                  ]}
              />
            </div>
            <div>
                <FloatingSelect
                  label="Phường/ Xã"
                  required={true}
                  value={formData.ward}
                  onChange={(value) => setFormData(prev => ({ ...prev, ward: value }))}
                  options={[
                    { value: "AH", label: "Phường An Hoà" },
                    { value: "PX", label: "Phường Phúc Xá" },
                    { value: "BN", label: "Phường Bến Nghé" }
                  ]}
                />
              </div>
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
        title="Bạn có chắc muốn xóa chi nhánh đã chọn"
        message="Bạn đang thực hiện xóa chi nhánh, việc này không thể hoàn tác! Bạn có chắc chắn muốn xóa không?"
        confirmText="ĐỒNG Ý"
        cancelText="KHÔNG"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        width="w-fit"
      />
          </div>
  );
};

export default BranchesPage;