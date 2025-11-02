import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { FloatingInput, FloatingSelect, Label, Input } from '../../components/ui';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { PaginationFooter } from '../../components/ui/PaginationFooter';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MoreVertical, Edit, Trash2, Plus, Filter, Key, RotateCcw } from '../../components/Icons';
import { usersApi } from '../../services/users';
import { branchesApi } from '../../services/branches';
import { useAuth } from '../../hooks/useAuth';
import { User, UserFilter, UserRole } from '../../types';

const UsersPage: React.FC = () => {
  const { canCreate, canEdit, canDelete } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilter>({});
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    role: 'STAFF' as UserRole,
    branchId: '',
    status: 'active' as 'active' | 'inactive',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', page, limit, search, filters],
    queryFn: () => usersApi.getUsers({
      page,
      limit,
      q: search,
      ...filters
    }),
  });

  // Fetch branches for display
  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.getBranches({ page: 1, limit: 1000 })
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDeleteConfirm(false);
      setDeletingUser(null);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersApi.resetPassword(id, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowResetPasswordModal(false);
      setResettingUser(null);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    },
  });

  // Helper functions
  const resetForm = () => {
      setFormData({
      username: '',
      fullName: '',
      role: 'STAFF',
      branchId: '',
      status: 'active',
      email: '',
    });
  };

  const getBranchName = (branchId: string) => {
    if (!branchId || !branchesData?.items) return 'Không có';
    const branch = branchesData.items.find(b => b.id === branchId);
    return branch ? branch.name : 'Không có';
  };

  const handleCreate = () => {
    if (!formData.username || !formData.fullName) return;
    createMutation.mutate(formData);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId || '',
      status: user.status,
      email: user.email || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editingUser || !formData.username || !formData.fullName) return;
    updateMutation.mutate({
      id: editingUser.id,
      data: formData
    });
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingUser) {
      deleteMutation.mutate(deletingUser.id);
    }
  };

  const handleResetPassword = (user: User) => {
    setResettingUser(user);
    setShowResetPasswordModal(true);
  };

  const confirmResetPassword = () => {
    if (resettingUser && passwordData.newPassword) {
      resetPasswordMutation.mutate({
        id: resettingUser.id,
        newPassword: passwordData.newPassword
      });
    }
  };

  const handleApplyFilters = (newFilters: Record<string, string>) => {
    setFilters(newFilters as UserFilter);
    setPage(1);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof UserFilter];
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
             key === 'role' ? 'Quyền hạn' :
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
      key: 'role',
      label: 'Quyền hạn',
      type: 'select' as const,
      options: [
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
        { value: 'BRANCH_ADMIN', label: 'Branch Admin' },
        { value: 'STAFF', label: 'Staff' },
      ],
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Tạm dừng' },
      ],
    },
  ];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'BRANCH_ADMIN': return 'Branch Admin';
      case 'STAFF': return 'Staff';
      default: return role;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-gray-500 mb-4">Không thể tải danh sách người dùng</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Phân quyền</h1>
      </div>

      {/* Search, Filter and Actions */}
      <div className="mb-6 flex flex-col lg:flex-row gap-2 items-start lg:items-center">
        <div className="w-full lg:w-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tên đăng nhập/Họ tên"
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
            label="Quyền hạn"
            value={filters.role || ''}
            onChange={(value) => setFilters(prev => ({ ...prev, role: value || undefined }))}
            options={[
              { value: "SUPER_ADMIN", label: "Super Admin" },
              { value: "BRANCH_ADMIN", label: "Branch Admin" },
              { value: "STAFF", label: "Staff" }
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
              { value: "active", label: "Hoạt động" },
              { value: "inactive", label: "Tạm dừng" }
            ]}
            className="w-[170px]"
            height="h-10"
            isFilter={true}
          />
          
              <Button 
            variant="outline" 
            onClick={handleClearFilters}
            disabled={!Object.keys(filters).some(key => filters[key as keyof UserFilter]) && !search}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Xóa bộ lọc
              </Button>
          
          {canCreate('users') && (
            <Button className="ml-auto" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
              Thêm người dùng
              </Button>
          )}
            </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Tên đăng nhập</TableHead>
              <TableHead className="font-semibold text-gray-900">Tên nhân viên</TableHead>
              <TableHead className="font-semibold text-gray-900">Chi nhánh</TableHead>
              <TableHead className="font-semibold text-gray-900">Thời gian cập nhật</TableHead>
              <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
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
            ) : usersData?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    title="Không có người dùng nào"
                    description="Chưa có người dùng nào được tìm thấy."
                    actionLabel="Thêm người dùng"
                    onAction={() => setShowCreateModal(true)}
                    canCreate={canCreate('users')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              usersData?.items.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onDoubleClick={() => canEdit('users') && handleEdit(user)}
                >
                  <TableCell>
                    <div className="font-medium">{user.username}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{user.fullName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {getBranchName(user.branchId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </TableCell>
                  <TableCell className="w-[50px]">
                    {(canEdit('users') || canDelete('users')) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        {canEdit('users') && (
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        )}
                        {canEdit('users') && (
                          <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                            <Key className="h-4 w-4 mr-2" />
                            Cấp mật khẩu mới
                          </DropdownMenuItem>
                        )}
                        {canDelete('users') && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa người dùng
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
      {usersData && usersData.total > 0 && (
        <PaginationFooter
          total={usersData.total}
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
            <DialogTitle>Tạo người dùng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <FloatingInput
                id="username"
                label="Tên đăng nhập"
                required={true}
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <FloatingInput
                id="fullName"
                label="Họ tên"
                required={true}
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div>
              <FloatingSelect
                label="Quyền hạn"
                required={true}
                value={formData.role}
                onChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
                options={[
                  { value: "STAFF", label: "Staff" },
                  { value: "BRANCH_ADMIN", label: "Branch Admin" },
                  { value: "SUPER_ADMIN", label: "Super Admin" }
                ]}
              />
            </div>
            <div>
              <FloatingInput
                id="branchId"
                label="Chi nhánh"
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
              />
            </div>
            <div>
              <FloatingSelect
                label="Trạng thái"
                required={true}
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
                options={[
                  { value: "active", label: "Hoạt động" },
                  { value: "inactive", label: "Tạm dừng" }
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
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Thông tin người dùng</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">Điền thông tin của người dùng</p>
          </DialogHeader>
          <div className="flex gap-8">
            {/* Left Column - Avatar and Status */}
            <div className="w-56 space-y-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="w-44 h-44 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" 
                      alt="Avatar" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                      <span className="text-6xl">👤</span>
                    </div>
                  </div>
                </div>
                <button className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600">
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
              </div>
              
              {/* Status Toggle */}
              <div className="text-center space-y-3">
                <span className="text-sm font-medium text-gray-700">Trạng thái kích hoạt</span>
                <div className="flex items-center justify-center space-x-3">
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <button
                      type="button"
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        status: prev.status === 'active' ? 'inactive' : 'active' 
                      }))}
                    />
                  </div>
                  <span className="text-sm font-medium text-green-600">Kích hoạt</span>
                </div>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="flex-1 space-y-6">
              {/* User Information Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <FloatingInput
                      id="edit-username"
                      label="Tên đăng nhập"
                      required={true}
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    />
                    <span className="absolute top-3 right-3 text-gray-400 text-sm">ⓘ</span>
                  </div>
                  <div className="relative">
                    <FloatingInput
                      id="edit-fullName"
                      label="Họ tên nhân viên"
                      required={true}
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                    <span className="absolute top-3 right-3 text-gray-400 text-sm">ⓘ</span>
                  </div>
                </div>
                <div>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-sm font-medium"
                    onClick={() => setShowResetPasswordModal(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    CẤP MẬT KHẨU MỚI
                  </Button>
                </div>
                <div className="relative">
                  <FloatingInput
                    id="edit-email"
                    label="Email (example: thutrang@agribank.vn)"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <span className="absolute top-3 right-3 text-gray-400 text-sm">ⓘ</span>
                </div>
              </div>

              {/* Permission Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">THÔNG TIN PHÂN QUYỀN</h3>
                
                <div>
                  <FloatingSelect
                    label="Áp dụng chi nhánh"
                    required={true}
                    value={formData.branchId}
                    onChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}
                    options={branchesData?.items.map(branch => ({
                      value: branch.id,
                      label: branch.name
                    })) || []}
                  />
                  <span className="text-red-500 text-sm ml-1">*</span>
                </div>

                <h4 className="text-md font-bold text-gray-900 uppercase tracking-wide">PHÂN QUYỀN CHÍNH</h4>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.role === 'BRANCH_ADMIN'}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          role: e.target.checked ? 'BRANCH_ADMIN' : 'STAFF' 
                        }))}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium">Admin chi nhánh</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.role === 'SUPER_ADMIN'}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          role: e.target.checked ? 'SUPER_ADMIN' : 'STAFF' 
                        }))}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium">Kiểm soát viên</span>
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium">Báo cáo</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.role === 'STAFF'}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          role: e.target.checked ? 'STAFF' : 'BRANCH_ADMIN' 
                        }))}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium">Giao dịch viên</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 font-bold text-sm"
                  onClick={() => setShowEditModal(false)}
                >
                  <span className="mr-2 text-white">×</span>
                  HỦY
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 font-bold text-sm"
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                >
                  <span className="mr-2 text-white">💾</span>
                  {updateMutation.isPending ? 'Đang lưu...' : 'LƯU'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cấp mật khẩu mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Mật khẩu mới *</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={confirmResetPassword}
                disabled={resetPasswordMutation.isPending || passwordData.newPassword !== passwordData.confirmPassword}
              >
                {resetPasswordMutation.isPending ? 'Đang cập nhật...' : 'Đồng ý'}
              </Button>
              <Button variant="outline" onClick={() => setShowResetPasswordModal(false)}>
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
        title="Bạn có chắc muốn xóa người dùng đã chọn"
        message="Bạn đang thực hiện xóa người dùng, việc này không thể hoàn tác! Bạn có chắc chắn muốn xóa không?"
        confirmText="ĐỒNG Ý"
        cancelText="KHÔNG"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        width="w-fit"
      />
    </div>
  );
};

export default UsersPage;