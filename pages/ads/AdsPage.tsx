import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { FilterChips } from '../../components/ui/FilterChips';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { PaginationFooter } from '../../components/ui/PaginationFooter';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MoreVertical, Edit, Trash2, Plus, Filter, Image, Play, FileText, List } from '../../components/Icons';
import { adsApi } from '../../services/ads';
import { useAuth } from '../../hooks/useAuth';
import { Advertisement, AdFilter } from '../../types';

const AdsPage: React.FC = () => {
  const { canCreate, canEdit, canDelete } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<AdFilter>({});
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deletingAd, setDeletingAd] = useState<Advertisement | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'image' as 'image' | 'video' | 'banner',
    duration: 0,
    startDate: '',
    endDate: '',
    targetBranchIds: [] as string[],
    isActive: true,
  });

  // Fetch ads
  const { data: adsData, isLoading, error } = useQuery({
    queryKey: ['ads', page, limit, search, filters],
    queryFn: () => adsApi.getAds({
      page,
      limit,
      q: search,
      ...filters
    }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: adsApi.createAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Advertisement> }) =>
      adsApi.updateAd(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      setShowEditModal(false);
      setEditingAd(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adsApi.deleteAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      setShowDeleteConfirm(false);
      setDeletingAd(null);
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      branchId: '',
      type: 'image',
      startDate: '',
      endDate: '',
      status: 'draft',
    });
  };

  const handleCreate = () => {
    if (!formData.code || !formData.name) return;
    createMutation.mutate(formData);
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      code: ad.code,
      name: ad.name,
      branchId: ad.branchId || '',
      type: ad.type,
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      status: ad.status,
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingAd || !formData.code || !formData.name) return;
    updateMutation.mutate({
      id: editingAd.id,
      data: formData
    });
  };

  const handleDelete = (ad: Advertisement) => {
    setDeletingAd(ad);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingAd) {
      deleteMutation.mutate(deletingAd.id);
    }
  };

  const handleApplyFilters = (newFilters: Record<string, string>) => {
    setFilters(newFilters as AdFilter);
    setPage(1);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof AdFilter];
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
      label: key === 'branchId' ? 'Chi nhánh' :
             key === 'status' ? 'Trạng thái' :
             key === 'type' ? 'Loại quảng cáo' :
             key === 'startDate' ? 'Ngày bắt đầu' :
             key === 'endDate' ? 'Ngày kết thúc' : key,
      value,
      type: key === 'startDate' || key === 'endDate' ? 'date' :
            key === 'status' ? 'status' :
            key === 'type' ? 'default' : 'default'
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
        { value: 'draft', label: 'Bản nháp' },
        { value: 'scheduled', label: 'Đã lên lịch' },
        { value: 'running', label: 'Đang chạy' },
        { value: 'paused', label: 'Tạm dừng' },
        { value: 'ended', label: 'Đã kết thúc' },
      ],
    },
    {
      key: 'type',
      label: 'Loại quảng cáo',
      type: 'select' as const,
      options: [
        { value: 'image', label: 'Hình ảnh' },
        { value: 'video', label: 'Video' },
        { value: 'html', label: 'HTML' },
        { value: 'playlist', label: 'Playlist' },
      ],
    },
    {
      key: 'dateRange',
      label: 'Khoảng thời gian',
      type: 'custom' as const,
      component: (
        <DateRangePicker
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartDateChange={(value) => setFilters(prev => ({ ...prev, startDate: value }))}
          onEndDateChange={(value) => setFilters(prev => ({ ...prev, endDate: value }))}
          onClear={() => setFilters(prev => ({ ...prev, startDate: '', endDate: '' }))}
        />
      )
    },
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return 'Hình ảnh';
      case 'video': return 'Video';
      case 'html': return 'HTML';
      case 'playlist': return 'Playlist';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Play className="h-4 w-4" />;
      case 'html': return <FileText className="h-4 w-4" />;
      case 'playlist': return <List className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Bản nháp';
      case 'scheduled': return 'Đã lên lịch';
      case 'running': return 'Đang chạy';
      case 'paused': return 'Tạm dừng';
      case 'ended': return 'Đã kết thúc';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'ended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-gray-500 mb-4">Không thể tải danh sách quảng cáo</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quảng cáo</h1>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Mã quảng cáo/Tên quảng cáo"
        />
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowFilterSheet(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Lọc dữ liệu
          </Button>
          
          {canCreate('ads') && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm quảng cáo
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
              <TableHead className="font-semibold text-gray-900">Mã quảng cáo</TableHead>
              <TableHead className="font-semibold text-gray-900">Tên quảng cáo</TableHead>
              <TableHead className="font-semibold text-gray-900">Loại</TableHead>
              <TableHead className="font-semibold text-gray-900">Chi nhánh</TableHead>
              <TableHead className="font-semibold text-gray-900">Thời gian</TableHead>
              <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-900">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <LoadingSkeleton rows={5} columns={7} />
                </TableCell>
              </TableRow>
            ) : adsData?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    title="Không có quảng cáo nào"
                    description="Chưa có quảng cáo nào được tìm thấy."
                    actionLabel="Thêm quảng cáo"
                    onAction={() => setShowCreateModal(true)}
                    canCreate={canCreate('ads')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              adsData?.items.map((ad) => (
                <TableRow 
                  key={ad.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onDoubleClick={() => canEdit('ads') && handleEdit(ad)}
                >
                  <TableCell>
                    <div className="font-medium">{ad.code}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{ad.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(ad.type)}
                      <span className="text-sm">{getTypeLabel(ad.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {ad.branchId || 'Tất cả chi nhánh'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {ad.startDate && ad.endDate ? (
                        <>
                          <div>{new Date(ad.startDate).toLocaleDateString('vi-VN')}</div>
                          <div className="text-xs text-gray-400">
                            đến {new Date(ad.endDate).toLocaleDateString('vi-VN')}
                          </div>
                        </>
                      ) : (
                        'Không giới hạn'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ad.status)}`}>
                      {getStatusLabel(ad.status)}
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
                        {canEdit('ads') && (
                          <DropdownMenuItem onClick={() => handleEdit(ad)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        )}
                        {canDelete('ads') && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(ad)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa quảng cáo
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
      {adsData && adsData.total > 0 && (
        <PaginationFooter
          total={adsData.total}
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
            <DialogTitle>Tạo quảng cáo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Mã quảng cáo *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Nhập mã quảng cáo"
              />
            </div>
            <div>
              <Label htmlFor="name">Tên quảng cáo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên quảng cáo"
              />
            </div>
            <div>
              <Label htmlFor="type">Loại quảng cáo *</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'image' | 'video' | 'html' | 'playlist' }))}
              >
                <option value="image">Hình ảnh</option>
                <option value="video">Video</option>
                <option value="html">HTML</option>
                <option value="playlist">Playlist</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="branchId">Chi nhánh</Label>
              <Input
                id="branchId"
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                placeholder="Nhập ID chi nhánh (để trống cho tất cả)"
              />
            </div>
            <div>
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Ngày kết thúc</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'scheduled' | 'running' | 'paused' | 'ended' }))}
              >
                <option value="draft">Bản nháp</option>
                <option value="scheduled">Đã lên lịch</option>
                <option value="running">Đang chạy</option>
                <option value="paused">Tạm dừng</option>
                <option value="ended">Đã kết thúc</option>
              </Select>
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
            <DialogTitle>Thông tin quảng cáo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Mã quảng cáo *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Nhập mã quảng cáo"
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Tên quảng cáo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên quảng cáo"
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Loại quảng cáo *</Label>
              <Select
                id="edit-type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'image' | 'video' | 'html' | 'playlist' }))}
              >
                <option value="image">Hình ảnh</option>
                <option value="video">Video</option>
                <option value="html">HTML</option>
                <option value="playlist">Playlist</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-branchId">Chi nhánh</Label>
              <Input
                id="edit-branchId"
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                placeholder="Nhập ID chi nhánh (để trống cho tất cả)"
              />
            </div>
            <div>
              <Label htmlFor="edit-startDate">Ngày bắt đầu</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-endDate">Ngày kết thúc</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'scheduled' | 'running' | 'paused' | 'ended' }))}
              >
                <option value="draft">Bản nháp</option>
                <option value="scheduled">Đã lên lịch</option>
                <option value="running">Đang chạy</option>
                <option value="paused">Tạm dừng</option>
                <option value="ended">Đã kết thúc</option>
              </Select>
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
        message={`Bạn có chắc chắn muốn xóa quảng cáo "${deletingAd?.name}" này không?`}
        confirmText="Đồng ý"
        cancelText="Không"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdsPage;