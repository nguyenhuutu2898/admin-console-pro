import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select, SelectItem, SelectValue } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import { adminApi } from '../../services/api';
import type { AuditLogEntry } from '../../types';

const statusColorMap: Record<'success' | 'warning' | 'error', 'default' | 'secondary' | 'destructive'> = {
  success: 'secondary',
  warning: 'default',
  error: 'destructive',
};

const relativeTime = (isoDate: string) => {
  const now = Date.now();
  const diff = now - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const AdminAuditPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: auditLogs, isLoading: logsLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  const filteredLogs = useMemo(() => {
    if (!auditLogs) return [];

    return auditLogs.filter(log => {
      const matchesSearch = [log.action, log.actor, log.target, log.ipAddress ?? '']
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());
      const matchesStatus = statusFilter ? log.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [auditLogs, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Audit activity</CardTitle>
          <CardDescription>Review sensitive actions taken inside the admin console.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total events</p>
            {logsLoading ? <Skeleton className="mt-2 h-6 w-16" /> : <p className="mt-2 text-2xl font-semibold">{auditLogs?.length ?? 0}</p>}
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Warnings</p>
            {logsLoading ? (
              <Skeleton className="mt-2 h-6 w-16" />
            ) : (
              <p className="mt-2 text-2xl font-semibold">
                {auditLogs?.filter(log => log.status === 'warning').length ?? 0}
              </p>
            )}
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Errors</p>
            {logsLoading ? (
              <Skeleton className="mt-2 h-6 w-16" />
            ) : (
              <p className="mt-2 text-2xl font-semibold">
                {auditLogs?.filter(log => log.status === 'error').length ?? 0}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Event log</CardTitle>
            <CardDescription>Search by action, actor or resource to understand changes.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <Input
              className="w-full md:max-w-sm"
              placeholder="Search events"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
            <Select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="w-full md:w-40">
              <SelectValue placeholder="All statuses" />
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={`audit-row-${index}`} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-[140px]">Timestamp</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.actor}</TableCell>
                      <TableCell>{log.target}</TableCell>
                      <TableCell>
                        <Badge variant={statusColorMap[log.status]} className="uppercase">
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{relativeTime(log.timestamp)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.ipAddress ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-10 text-center">
              <p className="text-sm font-medium">No events found with the current filters.</p>
              <p className="mt-1 text-sm text-muted-foreground">Adjust your search or clear the status filter.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditPage;
