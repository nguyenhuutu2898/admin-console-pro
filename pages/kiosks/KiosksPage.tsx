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
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MoreVertical, Edit, Trash2, Plus, Filter, Monitor, RefreshCcw, RotateCcw } from '../../components/Icons';
import { kiosksApi } from '../../services/kiosks';
import { useAuth } from '../../hooks/useAuth';
import { Kiosk, KioskFilter } from '../../types';

const KiosksPage: React.FC = () => {
  const { canCreate, canEdit, canDelete } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<KioskFilter>({});
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [editingKiosk, setEditingKiosk] = useState<Kiosk | null>(null);
  const [deletingKiosk, setDeletingKiosk] = useState<Kiosk | null>(null);
  const [connectingKiosk, setConnectingKiosk] = useState<Kiosk | null>(null);
  const [connectionCode, setConnectionCode] = useState<{ code: string; expiresIn: number } | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    branchId: '',
    status: 'disconnected' as 'connected' | 'disconnected' | 'inactive',
  });

  // Fetch kiosks
  const { data: kiosksData, isLoading, error } = useQuery({
    queryKey: ['kiosks', page, limit, search, filters],
    queryFn: () => kiosksApi.getKiosks({
      page,
      limit,
      q: search,
      ...filters
    }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: kiosksApi.createKiosk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosks'] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Kiosk> }) =>
      kiosksApi.updateKiosk(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosks'] });
      setShowEditModal(false);
      setEditingKiosk(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: kiosksApi.deleteKiosk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosks'] });
      setShowDeleteConfirm(false);
      setDeletingKiosk(null);
    },
  });

  const connectMutation = useMutation({
    mutationFn: kiosksApi.generateConnectCode,
    onSuccess: (data) => {
      setConnectionCode(data);
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      branchId: '',
      status: 'disconnected',
    });
  };

  const handleCreate = () => {
    if (!formData.code || !formData.name || !formData.branchId) return;
    createMutation.mutate(formData);
  };

  const handleEdit = (kiosk: Kiosk) => {
    setEditingKiosk(kiosk);
    setFormData({
      code: kiosk.code,
      name: kiosk.name,
      branchId: kiosk.branchId,
      status: kiosk.status,
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingKiosk || !formData.code || !formData.name || !formData.branchId) return;
    updateMutation.mutate({
      id: editingKiosk.id,
      data: formData
    });
  };

  const handleDelete = (kiosk: Kiosk) => {
    setDeletingKiosk(kiosk);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingKiosk) {
      deleteMutation.mutate(deletingKiosk.id);
    }
  };

  const handleConnect = (kiosk: Kiosk) => {
    setConnectingKiosk(kiosk);
    setShowConnectModal(true);
    connectMutation.mutate(kiosk.id);
  };

  const handleRefreshConnectionCode = () => {
    if (connectingKiosk) {
      connectMutation.mutate(connectingKiosk.id);
    }
  };

  const handleApplyFilters = (newFilters: Record<string, string>) => {
    setFilters(newFilters as KioskFilter);
    setPage(1);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof KioskFilter];
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
      label: key === 'branchId' ? 'Chi nhánh' :
             key === 'status' ? 'Trạng thái' : key,
      value
    }));

  // Filter fields for FilterSheet
  const filterFields = [
    {
      key: 'branchId',
      label: 'Chi nhánh',
      type: 'text' as const,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      options: [
        { value: 'connected', label: 'Đã kết nối' },
        { value: 'disconnected', label: 'Chưa kết nối' },
        { value: 'inactive', label: 'Không hoạt động' },
      ],
    },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected': return 'Đã kết nối';
      case 'disconnected': return 'Chưa kết nối';
      case 'inactive': return 'Không hoạt động';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-gray-500 mb-4">Không thể tải danh sách kiosk</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kiosk</h1>
      </div>

      {/* Search, Filter and Actions */}
      <div className="mb-6 flex flex-col lg:flex-row gap-2 items-start lg:items-center">
        <div className="w-full lg:w-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tên kiosk/Mã kiosk"
            label="Tìm kiếm"
            width="w-full lg:w-80"
            height="h-10"
            isFilter={true}
          />
        </div>
        
        <div className="flex flex-1 items-center gap-2 w-full lg:w-auto">
          <FloatingSelect
            label="Chi nhánh"
            value={filters.branchId || ''}
            onChange={(value) => setFilters(prev => ({ ...prev, branchId: value || undefined }))}
            options={[
              { value: "1", label: "Chi nhánh Hà Nội" },
              { value: "2", label: "Chi nhánh TP.HCM" },
              { value: "3", label: "Chi nhánh Đà Nẵng" }
            ]}
            className="w-[170px]"
            height="h-10"
            isFilter={true}
          />
          
          <FloatingSelect
            label="Trạng thái"
            value={filters.status || ''}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}
            options={[
              { value: "connected", label: "Đã kết nối" },
              { value: "disconnected", label: "Chưa kết nối" },
              { value: "inactive", label: "Không hoạt động" }
            ]}
            className="w-[170px]"
            height="h-10"
            isFilter={true}
          />
          
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            disabled={!Object.keys(filters).some(key => filters[key as keyof KioskFilter]) && !search}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
          
          {canCreate('kiosks') && (
            <Button className="ml-auto" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm kiosk
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Mã kiosk</TableHead>
              <TableHead className="font-semibold text-gray-900">Tên kiosk</TableHead>
              <TableHead className="font-semibold text-gray-900">Chi nhánh</TableHead>
              <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-900">Lần cuối kết nối</TableHead>
              <TableHead className="font-semibold text-gray-900 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <LoadingSkeleton rows={5} columns={6} />
                </TableCell>
              </TableRow>
            ) : kiosksData?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    title="Không có kiosk nào"
                    description="Chưa có kiosk nào được tìm thấy."
                    actionLabel="Thêm kiosk"
                    onAction={() => setShowCreateModal(true)}
                    canCreate={canCreate('kiosks')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              kiosksData?.items.map((kiosk) => (
                <TableRow 
                  key={kiosk.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onDoubleClick={() => canEdit('kiosks') && handleEdit(kiosk)}
                >
                  <TableCell>
                    <div className="font-medium">{kiosk.code}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{kiosk.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {kiosk.branchId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(kiosk.status)}`}>
                      {getStatusLabel(kiosk.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {kiosk.lastSeenAt ? new Date(kiosk.lastSeenAt).toLocaleString('vi-VN') : 'Chưa kết nối'}
                    </div>
                  </TableCell>
                  <TableCell className="w-[50px]">
                    {(canEdit('kiosks') || canDelete('kiosks')) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit('kiosks') && (
                            <DropdownMenuItem onClick={() => handleEdit(kiosk)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                          )}
                          {canEdit('kiosks') && (
                            <DropdownMenuItem onClick={() => handleConnect(kiosk)}>
                              <Monitor className="h-4 w-4 mr-2" />
                              Kết nối thiết bị
                            </DropdownMenuItem>
                          )}
                          {canDelete('kiosks') && (
                            <DropdownMenuItem 
                              onClick={() => handleDelete(kiosk)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa kiosk
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
      {kiosksData && kiosksData.total > 0 && (
        <PaginationFooter
          total={kiosksData.total}
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
            <DialogTitle>Tạo thiết bị</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <FloatingInput
                id="code"
                label="Mã kiosk"
                required={true}
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <div>
              <FloatingInput
                id="name"
                label="Tên kiosk"
                required={true}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <FloatingInput
                id="branchId"
                label="Chi nhánh"
                required={true}
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
              />
            </div>
            <div>
              <FloatingSelect
                label="Trạng thái"
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'connected' | 'disconnected' | 'inactive' }))}
                options={[
                  { value: "disconnected", label: "Chưa kết nối" },
                  { value: "connected", label: "Đã kết nối" },
                  { value: "inactive", label: "Không hoạt động" }
                ]}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin liên kết thiết bị</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <FloatingInput
                id="edit-code"
                label="Mã kiosk"
                required={true}
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <div>
              <FloatingInput
                id="edit-name"
                label="Tên kiosk"
                required={true}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <FloatingInput
                id="edit-branchId"
                label="Chi nhánh"
                required={true}
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
              />
            </div>
            <div>
              <FloatingSelect
                label="Trạng thái"
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'connected' | 'disconnected' | 'inactive' }))}
                options={[
                  { value: "disconnected", label: "Chưa kết nối" },
                  { value: "connected", label: "Đã kết nối" },
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

      {/* Connect Device Modal */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kết nối thiết bị</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-6 mb-4">
                <div className="text-2xl font-mono font-bold text-gray-800">
                  {connectionCode?.code || 'Đang tạo mã...'}
                </div>
                {connectionCode && (
                  <div className="text-sm text-gray-500 mt-2">
                    Mã hết hạn sau: {connectionCode.expiresIn} giây
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleRefreshConnectionCode}
                disabled={connectMutation.isPending}
                className="mb-4"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                {connectMutation.isPending ? 'Đang tạo...' : 'Làm mới mã'}
              </Button>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={() => setShowConnectModal(false)}
              >
                Đóng
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
        title="Bạn có chắc muốn xóa kiosk đã chọn"
        message="Bạn đang thực hiện xóa kiosk, việc này không thể hoàn tác! Bạn có chắc chắn muốn xóa không?"
        confirmText="ĐỒNG Ý"
        cancelText="KHÔNG"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        width="w-fit"
      />
    </div>
  );
};

export default KiosksPage;