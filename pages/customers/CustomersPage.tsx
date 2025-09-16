import React, { useState } from 'react';
// FIX: import keepPreviousData for TanStack Query v5
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { customersApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, ChevronRight } from '../../components/Icons';
// FIX: import Customer and PaginatedResponse types
import { Customer, PaginatedResponse } from '../../types';

const CustomersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // FIX: Switched to placeholderData for TanStack Query v5 and added explicit type for useQuery
  const { data, isFetching } = useQuery<PaginatedResponse<Customer>>({
    queryKey: ['customers', page, limit, debouncedSearchTerm],
    queryFn: () => customersApi.getCustomers({ page, limit, q: debouncedSearchTerm }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const isLoading = isFetching && !data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">No customers found.</TableCell>
                </TableRow>
            ) : (
              data?.data.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.joinDate}</TableCell>
                  <TableCell className="text-right">${customer.totalSpent.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing page {data?.page ?? 0} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
          >
            <ChevronLeft className="h-4 w-4 mr-1"/>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isFetching}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1"/>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;