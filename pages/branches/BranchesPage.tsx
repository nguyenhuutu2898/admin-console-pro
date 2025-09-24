import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Building } from '../../components/Icons';
import { branchesApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { type Branch } from '../../types';

const BranchesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ status: '' });
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    managerName: ''
  });
  
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: branchesData, isLoading } = useQuery({
    queryKey: ['branches', currentPage, itemsPerPage, debouncedSearchTerm, appliedFilters],
    queryFn: () => branchesApi.getBranches({
      page: currentPage,
      limit: itemsPerPage,
      q: debouncedSearchTerm,
      status: appliedFilters.status
    }),
  });

  const deleteBranchMutation = useMutation({
    mutationFn: branchesApi.deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: branchesApi.createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setShowAddModal(false);
      resetForm();
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: branchesApi.updateBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setShowEditModal(false);
      setEditingBranch(null);
      resetForm();
    },
  });

  const handleEdit = (branchId: string): void => {
    const branch = branchesData?.data.find(b => b.id === branchId);
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address,
        phone: branch.phone || '',
        email: branch.email || '',
        managerName: branch.managerName || ''
      });
      setShowEditModal(true);
    }
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      managerName: ''
    });
  };

  const handleDelete = async (branchId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await deleteBranchMutation.mutateAsync(branchId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleAddBranch = (): void => {
    resetForm();
    setShowAddModal(true);
  };

  const handleSubmitAdd = (): void => {
    if (!formData.name || !formData.address) {
      alert('Please fill in required fields');
      return;
    }
    
    createBranchMutation.mutate({
      name: formData.name,
      address: formData.address,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      managerName: formData.managerName || undefined,
      isActive: true
    });
  };

  const handleSubmitEdit = (): void => {
    if (!formData.name || !formData.address || !editingBranch) {
      alert('Please fill in required fields');
      return;
    }
    
    updateBranchMutation.mutate({
      ...editingBranch,
      name: formData.name,
      address: formData.address,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      managerName: formData.managerName || undefined,
    });
  };

  const handleFilterData = (): void => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (): void => {
    setAppliedFilters({ status: filterStatus });
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleClearFilters = (): void => {
    setFilterStatus('');
    setAppliedFilters({ status: '' });
    setCurrentPage(1);
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Branch Management</h1>
      </div>

      {/* Search and Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search branches..."
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
            onClick={handleAddBranch}
          >
            <Plus className="h-4 w-4 mr-2" />
            ADD BRANCH
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Branch Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Address</TableHead>
              <TableHead className="font-semibold text-gray-900">Manager</TableHead>
              <TableHead className="font-semibold text-gray-900">Phone</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                </TableRow>
              ))
            ) : branchesData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No branches found.</TableCell>
              </TableRow>
            ) : (
              branchesData?.data.map((branch) => (
                <TableRow key={branch.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{branch.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">{branch.address}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{branch.managerName || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">{branch.phone || '-'}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(branch.isActive)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(branch.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(branch.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Branch
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
          <span className="text-sm text-gray-700">Total: {branchesData?.total || 0}</span>
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
          
          {Array.from({ length: Math.min(5, Math.ceil((branchesData?.total || 0) / itemsPerPage)) }, (_, i) => {
            const pageNum = i + 1;
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
          
          {Math.ceil((branchesData?.total || 0) / itemsPerPage) > 5 && (
            <>
              <span className="px-2">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.ceil((branchesData?.total || 0) / itemsPerPage))}
                disabled={isLoading}
              >
                {Math.ceil((branchesData?.total || 0) / itemsPerPage)}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil((branchesData?.total || 0) / itemsPerPage), prev + 1))}
            disabled={currentPage === Math.ceil((branchesData?.total || 0) / itemsPerPage) || isLoading}
          >
            →
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Jump to</span>
          <Input
            type="number"
            min="1"
            max={Math.ceil((branchesData?.total || 0) / itemsPerPage)}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-16 h-8 text-center"
          />
        </div>
      </div>

      {/* Add Branch Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Branch Name *</label>
              <Input 
                placeholder="Enter branch name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <Input 
                placeholder="Enter branch address" 
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input 
                placeholder="Enter phone number" 
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                placeholder="Enter email address" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Manager</label>
              <Input 
                placeholder="Enter manager name" 
                value={formData.managerName}
                onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={handleSubmitAdd}
                disabled={createBranchMutation.isPending}
              >
                {createBranchMutation.isPending ? 'Adding...' : 'Add Branch'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Branch Name *</label>
              <Input 
                placeholder="Enter branch name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <Input 
                placeholder="Enter branch address" 
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input 
                placeholder="Enter phone number" 
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                placeholder="Enter email address" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Manager</label>
              <Input 
                placeholder="Enter manager name" 
                value={formData.managerName}
                onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={handleSubmitEdit}
                disabled={updateBranchMutation.isPending}
              >
                {updateBranchMutation.isPending ? 'Updating...' : 'Update Branch'}
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
            <DialogTitle>Filter Branches</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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

export default BranchesPage;
