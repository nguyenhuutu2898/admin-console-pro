import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Image, Play } from '../../components/Icons';
import { advertisementsApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { type Advertisement } from '../../types';

const AdvertisementsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ type: '', status: '' });
  
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: advertisementsData, isLoading } = useQuery({
    queryKey: ['advertisements', currentPage, itemsPerPage, debouncedSearchTerm, appliedFilters],
    queryFn: () => advertisementsApi.getAdvertisements({
      page: currentPage,
      limit: itemsPerPage,
      q: debouncedSearchTerm,
      type: appliedFilters.type,
      status: appliedFilters.status
    }),
  });

  const deleteAdvertisementMutation = useMutation({
    mutationFn: advertisementsApi.deleteAdvertisement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });

  const handleEdit = (advertisementId: string): void => {
    console.log('Edit advertisement:', advertisementId);
    // TODO: Implement edit advertisement modal
  };

  const handleDelete = async (advertisementId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await deleteAdvertisementMutation.mutateAsync(advertisementId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleAddAdvertisement = (): void => {
    setShowAddModal(true);
  };

  const handleFilterData = (): void => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (): void => {
    setAppliedFilters({ type: filterType, status: filterStatus });
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleClearFilters = (): void => {
    setFilterType('');
    setFilterStatus('');
    setAppliedFilters({ type: '', status: '' });
    setCurrentPage(1);
  };

  const getTypeIcon = (type: Advertisement['type']) => {
    return type === 'image' ? (
      <Image className="h-4 w-4 text-blue-600" />
    ) : (
      <Play className="h-4 w-4 text-purple-600" />
    );
  };

  const getTypeBadge = (type: Advertisement['type']) => {
    const isImage = type === 'image';
    return (
      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
        isImage ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
      }`}>
        {getTypeIcon(type)}
        {isImage ? 'Image' : 'Video'}
      </span>
    );
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

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Advertisement Management</h1>
      </div>

      {/* Search and Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search advertisements..."
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
            onClick={handleAddAdvertisement}
          >
            <Plus className="h-4 w-4 mr-2" />
            ADD ADVERTISEMENT
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Title</TableHead>
              <TableHead className="font-semibold text-gray-900">Type</TableHead>
              <TableHead className="font-semibold text-gray-900">Duration</TableHead>
              <TableHead className="font-semibold text-gray-900">Start Date</TableHead>
              <TableHead className="font-semibold text-gray-900">End Date</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                </TableRow>
              ))
            ) : advertisementsData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No advertisements found.</TableCell>
              </TableRow>
            ) : (
              advertisementsData?.data.map((advertisement) => (
                <TableRow key={advertisement.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{advertisement.title}</div>
                      {advertisement.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {advertisement.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(advertisement.type)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {formatDuration(advertisement.duration)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(advertisement.startDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(advertisement.endDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(advertisement.isActive)}
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
                          <DropdownMenuItem onClick={() => handleEdit(advertisement.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(advertisement.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Advertisement
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
          <span className="text-sm text-gray-700">Total: {advertisementsData?.total || 0}</span>
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
          
          {Array.from({ length: Math.min(5, Math.ceil((advertisementsData?.total || 0) / itemsPerPage)) }, (_, i) => {
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
          
          {Math.ceil((advertisementsData?.total || 0) / itemsPerPage) > 5 && (
            <>
              <span className="px-2">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.ceil((advertisementsData?.total || 0) / itemsPerPage))}
                disabled={isLoading}
              >
                {Math.ceil((advertisementsData?.total || 0) / itemsPerPage)}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil((advertisementsData?.total || 0) / itemsPerPage), prev + 1))}
            disabled={currentPage === Math.ceil((advertisementsData?.total || 0) / itemsPerPage) || isLoading}
          >
            →
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Jump to</span>
          <Input
            type="number"
            min="1"
            max={Math.ceil((advertisementsData?.total || 0) / itemsPerPage)}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-16 h-8 text-center"
          />
        </div>
      </div>

      {/* Add Advertisement Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Advertisement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input placeholder="Enter advertisement title" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input placeholder="Enter description" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select>
                <option value="">Select type</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
              <Input type="number" placeholder="Enter duration for videos" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input type="date" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={() => setShowAddModal(false)}>
                Add Advertisement
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
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
            <DialogTitle>Filter Advertisements</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </Select>
            </div>
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

export default AdvertisementsPage;
