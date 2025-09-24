import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, User, Key, RefreshCcw } from '../../components/Icons';
import { usersApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { UserRole, type User } from '../../types';

const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterRole, setFilterRole] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ role: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    branch: ''
  });
  
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', currentPage, itemsPerPage, debouncedSearchTerm, appliedFilters],
    queryFn: () => usersApi.getUsers({
      page: currentPage,
      limit: itemsPerPage,
      q: debouncedSearchTerm,
      role: appliedFilters.role
    }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const assignPasswordMutation = useMutation({
    mutationFn: usersApi.assignPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: usersApi.resetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowAddModal(false);
      resetForm();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: usersApi.updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
    },
  });

  const handleEdit = (userId: string): void => {
    const user = usersData?.data.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch || ''
      });
      setShowEditModal(true);
    }
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      email: '',
      role: '',
      branch: ''
    });
  };

  const handleDelete = async (userId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserMutation.mutateAsync(userId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleAssignPassword = async (userId: string): Promise<void> => {
    try {
      await assignPasswordMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Assign password failed:', error);
    }
  };

  const handleResetPassword = async (userId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to reset this user\'s password?')) {
      try {
        await resetPasswordMutation.mutateAsync(userId);
      } catch (error) {
        console.error('Reset password failed:', error);
      }
    }
  };

  const handleAddUser = (): void => {
    resetForm();
    setShowAddModal(true);
  };

  const handleSubmitAdd = (): void => {
    if (!formData.name || !formData.email || !formData.role) {
      alert('Please fill in required fields');
      return;
    }
    
    createUserMutation.mutate({
      name: formData.name,
      email: formData.email,
      role: formData.role as UserRole,
      branch: formData.branch || undefined
    });
  };

  const handleSubmitEdit = (): void => {
    if (!formData.name || !formData.email || !formData.role || !editingUser) {
      alert('Please fill in required fields');
      return;
    }
    
    updateUserMutation.mutate({
      ...editingUser,
      name: formData.name,
      email: formData.email,
      role: formData.role as UserRole,
      branch: formData.branch || undefined
    });
  };

  const handleFilterData = (): void => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (): void => {
    setAppliedFilters({ role: filterRole });
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleClearFilters = (): void => {
    setFilterRole('');
    setAppliedFilters({ role: '' });
    setCurrentPage(1);
  };

  const getRoleText = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.STAFF:
        return 'Staff';
      case UserRole.VIEWER:
        return 'Viewer';
      default:
        return role;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
      </div>

      {/* Search and Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by username, full name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
            <div className="flex gap-2">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleFilterData}
              >
                <Filter className="h-4 w-4 mr-2" />
                FILTER DATA
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAddUser}
              >
                <Plus className="h-4 w-4 mr-2" />
                ADD USER
              </Button>
            </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Username</TableHead>
              <TableHead className="font-semibold text-gray-900">Employee Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Branch</TableHead>
              <TableHead className="font-semibold text-gray-900">Update Time</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                </TableRow>
              ))
            ) : usersData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No users found.</TableCell>
              </TableRow>
            ) : (
              usersData?.data.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{user.email.split('@')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">Role: {getRoleText(user.role)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {user.branch ? (
                        <>
                          <div className="font-medium">{user.branch}</div>
                          {user.address && (
                            <div className="text-sm text-gray-500">{user.address}</div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.updateTime}</div>
                      <div className="text-sm text-gray-500">{user.updateHour}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-medium">Active</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignPassword(user.id)}>
                            <Key className="h-4 w-4 mr-2" />
                            Assign Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">Total: {usersData?.total || 0}</span>
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={10}>10/page</option>
            <option value={20}>20/page</option>
            <option value={50}>50/page</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            ←
          </Button>
          
          {Array.from({ length: Math.min(5, Math.ceil((usersData?.total || 0) / itemsPerPage)) }, (_, i) => {
            const pageNum = i + 1;
            const totalPages = Math.ceil((usersData?.total || 0) / itemsPerPage);
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? "bg-blue-600 text-white" : ""}
                disabled={isLoading}
              >
                {pageNum}
              </Button>
            );
          })}
          
          {Math.ceil((usersData?.total || 0) / itemsPerPage) > 5 && (
            <>
              <span className="px-2">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.ceil((usersData?.total || 0) / itemsPerPage))}
                disabled={isLoading}
              >
                {Math.ceil((usersData?.total || 0) / itemsPerPage)}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil((usersData?.total || 0) / itemsPerPage), prev + 1))}
            disabled={currentPage === Math.ceil((usersData?.total || 0) / itemsPerPage) || isLoading}
          >
            →
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Jump to</span>
          <Input
            type="number"
            min="1"
            max={Math.ceil((usersData?.total || 0) / itemsPerPage)}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-16 h-8 text-center"
          />
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input 
                placeholder="Enter full name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input 
                placeholder="Enter email address" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role *</label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="">Select role</option>
                <option value="ADMIN">Administrator</option>
                <option value="STAFF">Staff</option>
                <option value="VIEWER">Viewer</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branch</label>
              <Input 
                placeholder="Enter branch name" 
                value={formData.branch}
                onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={handleSubmitAdd}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? 'Adding...' : 'Add User'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input 
                placeholder="Enter full name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input 
                placeholder="Enter email address" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role *</label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="">Select role</option>
                <option value="ADMIN">Administrator</option>
                <option value="STAFF">Staff</option>
                <option value="VIEWER">Viewer</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branch</label>
              <Input 
                placeholder="Enter branch name" 
                value={formData.branch}
                onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={handleSubmitEdit}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Users</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Administrator</option>
                <option value="STAFF">Staff</option>
                <option value="VIEWER">Viewer</option>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
              <Button variant="outline" onClick={() => setShowFilterModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
