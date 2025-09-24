import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Monitor, Key, RefreshCcw } from '../../components/Icons';
import { kiosksApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { type Kiosk } from '../../types';

const KiosksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ status: '', branch: '' });
  const [editingKiosk, setEditingKiosk] = useState<Kiosk | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    branchId: '',
    location: '',
    deviceId: ''
  });
  
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: kiosksData, isLoading } = useQuery({
    queryKey: ['kiosks', currentPage, itemsPerPage, debouncedSearchTerm, appliedFilters],
    queryFn: () => kiosksApi.getKiosks({
      page: currentPage,
      limit: itemsPerPage,
      q: debouncedSearchTerm,
      status: appliedFilters.status,
      branchId: appliedFilters.branch
    }),
  });

  const deleteKioskMutation = useMutation({
    mutationFn: kiosksApi.deleteKiosk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosks'] });
    },
  });

  const connectKioskMutation = useMutation({
    mutationFn: kiosksApi.connectKiosk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosks'] });
    },
  });

  const createKioskMutation = useMutation({
    mutationFn: kiosksApi.createKiosk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosks'] });
      setShowAddModal(false);
      resetForm();
    },
  });

  const updateKioskMutation = useMutation({
    mutationFn: kiosksApi.updateKiosk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosks'] });
      setShowEditModal(false);
      setEditingKiosk(null);
      resetForm();
    },
  });

  const handleEdit = (kioskId: string): void => {
    const kiosk = kiosksData?.data.find(k => k.id === kioskId);
    if (kiosk) {
      setEditingKiosk(kiosk);
      setFormData({
        name: kiosk.name,
        branchId: kiosk.branchId,
        location: kiosk.location,
        deviceId: kiosk.deviceId
      });
      setShowEditModal(true);
    }
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      branchId: '',
      location: '',
      deviceId: ''
    });
  };

  const handleDelete = async (kioskId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this kiosk?')) {
      try {
        await deleteKioskMutation.mutateAsync(kioskId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleConnect = async (kioskId: string): Promise<void> => {
    try {
      await connectKioskMutation.mutateAsync(kioskId);
    } catch (error) {
      console.error('Connect failed:', error);
    }
  };

  const handleAddKiosk = (): void => {
    resetForm();
    setShowAddModal(true);
  };

  const handleSubmitAdd = (): void => {
    if (!formData.name || !formData.branchId || !formData.deviceId) {
      alert('Please fill in required fields');
      return;
    }
    
    createKioskMutation.mutate({
      name: formData.name,
      branchId: formData.branchId,
      location: formData.location,
      deviceId: formData.deviceId,
      status: 'offline' as const
    });
  };

  const handleSubmitEdit = (): void => {
    if (!formData.name || !formData.branchId || !formData.deviceId || !editingKiosk) {
      alert('Please fill in required fields');
      return;
    }
    
    updateKioskMutation.mutate({
      ...editingKiosk,
      name: formData.name,
      branchId: formData.branchId,
      location: formData.location,
      deviceId: formData.deviceId
    });
  };

  const handleFilterData = (): void => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (): void => {
    setAppliedFilters({ status: filterStatus, branch: filterBranch });
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleClearFilters = (): void => {
    setFilterStatus('');
    setFilterBranch('');
    setAppliedFilters({ status: '', branch: '' });
    setCurrentPage(1);
  };

  const getStatusBadge = (status: Kiosk['status']) => {
    const statusConfig = {
      online: { bg: 'bg-green-100', text: 'text-green-800', label: 'Online' },
      offline: { bg: 'bg-red-100', text: 'text-red-800', label: 'Offline' },
      maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Maintenance' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kiosk Management</h1>
      </div>

      {/* Search and Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search kiosks..."
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
            onClick={handleAddKiosk}
          >
            <Plus className="h-4 w-4 mr-2" />
            ADD KIOSK
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Kiosk Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Branch</TableHead>
              <TableHead className="font-semibold text-gray-900">Location</TableHead>
              <TableHead className="font-semibold text-gray-900">Device ID</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Last Connected</TableHead>
              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                </TableRow>
              ))
            ) : kiosksData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No kiosks found.</TableCell>
              </TableRow>
            ) : (
              kiosksData?.data.map((kiosk) => (
                <TableRow key={kiosk.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{kiosk.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">{kiosk.branchName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">{kiosk.location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">{kiosk.deviceId}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(kiosk.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {kiosk.lastConnected || 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleConnect(kiosk.id)}>
                            <Key className="h-4 w-4 mr-2" />
                            Connect Device
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(kiosk.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(kiosk.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Kiosk
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
          <span className="text-sm text-gray-700">Total: {kiosksData?.total || 0}</span>
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
          
          {Array.from({ length: Math.min(5, Math.ceil((kiosksData?.total || 0) / itemsPerPage)) }, (_, i) => {
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
          
          {Math.ceil((kiosksData?.total || 0) / itemsPerPage) > 5 && (
            <>
              <span className="px-2">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.ceil((kiosksData?.total || 0) / itemsPerPage))}
                disabled={isLoading}
              >
                {Math.ceil((kiosksData?.total || 0) / itemsPerPage)}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil((kiosksData?.total || 0) / itemsPerPage), prev + 1))}
            disabled={currentPage === Math.ceil((kiosksData?.total || 0) / itemsPerPage) || isLoading}
          >
            →
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Jump to</span>
          <Input
            type="number"
            min="1"
            max={Math.ceil((kiosksData?.total || 0) / itemsPerPage)}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-16 h-8 text-center"
          />
        </div>
      </div>

      {/* Add Kiosk Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Kiosk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kiosk Name *</label>
              <Input 
                placeholder="Enter kiosk name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branch *</label>
              <Select
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
              >
                <option value="">Select branch</option>
                <option value="1">Ho Chi Minh City Branch</option>
                <option value="2">Hanoi Branch</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input 
                placeholder="Enter kiosk location" 
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Device ID *</label>
              <Input 
                placeholder="Enter device ID" 
                value={formData.deviceId}
                onChange={(e) => setFormData(prev => ({ ...prev, deviceId: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={handleSubmitAdd}
                disabled={createKioskMutation.isPending}
              >
                {createKioskMutation.isPending ? 'Adding...' : 'Add Kiosk'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Kiosk Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kiosk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kiosk Name *</label>
              <Input 
                placeholder="Enter kiosk name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branch *</label>
              <Select
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
              >
                <option value="">Select branch</option>
                <option value="1">Ho Chi Minh City Branch</option>
                <option value="2">Hanoi Branch</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input 
                placeholder="Enter kiosk location" 
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Device ID *</label>
              <Input 
                placeholder="Enter device ID" 
                value={formData.deviceId}
                onChange={(e) => setFormData(prev => ({ ...prev, deviceId: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={handleSubmitEdit}
                disabled={updateKioskMutation.isPending}
              >
                {updateKioskMutation.isPending ? 'Updating...' : 'Update Kiosk'}
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
            <DialogTitle>Filter Kiosks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branch</label>
              <Select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                <option value="">All Branches</option>
                <option value="1">Ho Chi Minh City Branch</option>
                <option value="2">Hanoi Branch</option>
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

export default KiosksPage;
