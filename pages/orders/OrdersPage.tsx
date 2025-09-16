import React, { useState } from "react";
// FIX: import keepPreviousData for TanStack Query v5
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ordersApi } from "../../services/api";
// FIX: import PaginatedResponse type
import { Order, PaginatedResponse } from "../../types";
import { useDebounce } from "../../hooks/useDebounce";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { ChevronLeft, ChevronRight } from "../../components/Icons";
import { toast } from "sonner";
import { Card } from "../../components/ui/Card";

const statusVariantMap: {
  [key in Order["status"]]: "default" | "secondary" | "destructive" | "outline";
} = {
  pending: "secondary",
  processing: "default",
  shipped: "outline",
  delivered: "default", // would be green in a real app
  cancelled: "destructive",
};

const OrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // Applied state
  const [applied, setApplied] = useState({ q: "", status: "", from: "", to: "" });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // FIX: Switched to placeholderData for TanStack Query v5 and added explicit type for useQuery
  const { data, isFetching } = useQuery<PaginatedResponse<Order>>({
    queryKey: ["orders", page, limit, applied.q, applied.status, applied.from, applied.to],
    queryFn: () =>
      ordersApi.getOrders({
        page,
        limit,
        q: applied.q,
        status: applied.status,
        fromDate: applied.from || undefined,
        toDate: applied.to || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const isLoading = isFetching && !data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <Button
            onClick={() => {
              setPage(1);
              setApplied({ q: debouncedSearchTerm, status: statusFilter, from: fromDate, to: toDate });
            }}
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setFromDate("");
              setToDate("");
              setPage(1);
              setApplied({ q: "", status: "", from: "", to: "" });
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-16 ml-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell className="text-right">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariantMap[order.status]}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing page {data?.page ?? 0} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isFetching}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
