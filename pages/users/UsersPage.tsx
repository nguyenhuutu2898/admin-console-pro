import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { FloatingInput, FloatingSelect } from '../../components/ui';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { FilterChips } from '../../components/ui/FilterChips';
import { PaginationFooter } from '../../components/ui/PaginationFooter';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MoreVertical, Edit, Trash2, Plus, Filter, Key } from '../../components/Icons';
import { usersApi } from '../../services/users';
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
    });
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

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tên đăng nhập/Họ tên"
        />
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowFilterSheet(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Lọc dữ liệu
          </Button>
          
          {canCreate('users') && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm người dùng
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
              <TableHead className="font-semibold text-gray-900">Tên đăng nhập</TableHead>
              <TableHead className="font-semibold text-gray-900">Họ tên</TableHead>
              <TableHead className="font-semibold text-gray-900">Quyền hạn</TableHead>
              <TableHead className="font-semibold text-gray-900">Chi nhánh</TableHead>
              <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
              <TableHead className="font-semibold text-gray-900">Thao tác</TableHead>
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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'BRANCH_ADMIN' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {user.branchId || 'Không có'}
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
                  <TableCell>
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
        <DialogContent className="max-w-md">
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
                id="role"
                label="Quyền hạn"
                required={true}
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
              >
                <option value="">Chọn quyền hạn</option>
                <option value="STAFF">Staff</option>
                <option value="BRANCH_ADMIN">Branch Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </FloatingSelect>
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
                id="status"
                label="Trạng thái"
                required={true}
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              >
                <option value="">Chọn trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </FloatingSelect>
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
            <DialogTitle>Thông tin người dùng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <FloatingInput
                id="edit-username"
                label="Tên đăng nhập"
                required={true}
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <FloatingInput
                id="edit-fullName"
                label="Họ tên"
                required={true}
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div>
              <FloatingSelect
                id="edit-role"
                label="Quyền hạn"
                required={true}
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
              >
                <option value="">Chọn quyền hạn</option>
                <option value="STAFF">Staff</option>
                <option value="BRANCH_ADMIN">Branch Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </FloatingSelect>
            </div>
            <div>
              <FloatingInput
                id="edit-branchId"
                label="Chi nhánh"
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
              />
            </div>
            <div>
              <FloatingSelect
                id="edit-status"
                label="Trạng thái"
                required={true}
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              >
                <option value="">Chọn trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </FloatingSelect>
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

      {/* Reset Password Modal */}
      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent className="max-w-md">
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
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa người dùng "${deletingUser?.fullName}" này không?`}
        confirmText="Đồng ý"
        cancelText="Không"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default UsersPage;