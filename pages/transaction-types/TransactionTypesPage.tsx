import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Skeleton } from '../../components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Receipt } from '../../components/Icons';
import { transactionTypesApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { type TransactionType } from '../../types';

const TransactionTypesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ status: '' });
  
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: transactionTypesData, isLoading } = useQuery({
    queryKey: ['transactionTypes', currentPage, itemsPerPage, debouncedSearchTerm, appliedFilters],
    queryFn: () => transactionTypesApi.getTransactionTypes({
      page: currentPage,
      limit: itemsPerPage,
      q: debouncedSearchTerm,
      status: appliedFilters.status
    }),
  });

  const deleteTransactionTypeMutation = useMutation({
    mutationFn: transactionTypesApi.deleteTransactionType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactionTypes'] });
    },
  });

  const handleEdit = (transactionTypeId: string): void => {
    console.log('Edit transaction type:', transactionTypeId);
    // TODO: Implement edit transaction type modal
  };

  const handleDelete = async (transactionTypeId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this transaction type?')) {
      try {
        await deleteTransactionTypeMutation.mutateAsync(transactionTypeId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleAddTransactionType = (): void => {
    setShowAddModal(true);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction Types Management</h1>
      </div>

      {/* Search and Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search transaction types..."
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
            onClick={handleAddTransactionType}
          >
            <Plus className="h-4 w-4 mr-2" />
            ADD TRANSACTION TYPE
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Code</TableHead>
              <TableHead className="font-semibold text-gray-900">Description</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Created At</TableHead>
              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                </TableRow>
              ))
            ) : transactionTypesData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No transaction types found.</TableCell>
              </TableRow>
            ) : (
              transactionTypesData?.data.map((transactionType) => (
                <TableRow key={transactionType.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{transactionType.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {transactionType.code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {transactionType.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transactionType.isActive)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(transactionType.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => handleEdit(transactionType.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(transactionType.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Transaction Type
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
          <span className="text-sm text-gray-700">Total: {transactionTypesData?.total || 0}</span>
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
          
          {Array.from({ length: Math.min(5, Math.ceil((transactionTypesData?.total || 0) / itemsPerPage)) }, (_, i) => {
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
          
          {Math.ceil((transactionTypesData?.total || 0) / itemsPerPage) > 5 && (
            <>
              <span className="px-2">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.ceil((transactionTypesData?.total || 0) / itemsPerPage))}
                disabled={isLoading}
              >
                {Math.ceil((transactionTypesData?.total || 0) / itemsPerPage)}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil((transactionTypesData?.total || 0) / itemsPerPage), prev + 1))}
            disabled={currentPage === Math.ceil((transactionTypesData?.total || 0) / itemsPerPage) || isLoading}
          >
            →
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Jump to</span>
          <Input
            type="number"
            min="1"
            max={Math.ceil((transactionTypesData?.total || 0) / itemsPerPage)}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-16 h-8 text-center"
          />
        </div>
      </div>

      {/* Add Transaction Type Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Transaction Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input placeholder="Enter transaction type name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <Input placeholder="Enter transaction code" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input placeholder="Enter description" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={() => setShowAddModal(false)}>
                Add Transaction Type
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
            <DialogTitle>Filter Transaction Types</DialogTitle>
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

export default TransactionTypesPage;
