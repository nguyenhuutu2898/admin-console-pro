import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import { buttonVariants } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { adminApi } from '../../services/api';
import type {
  AuditLogEntry,
  HealthCheckResult,
  SystemOverview,
  User,
} from '../../types';

const statusColorMap: Record<'success' | 'warning' | 'error', 'default' | 'secondary' | 'destructive'> = {
  success: 'secondary',
  warning: 'default',
  error: 'destructive',
};

const serviceStatusBadge: Record<'operational' | 'degraded' | 'offline', { label: string; className: string }> = {
  operational: { label: 'Operational', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  degraded: { label: 'Degraded', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  offline: { label: 'Offline', className: 'bg-destructive/10 text-destructive' },
};

const healthStatusStyles: Record<HealthCheckResult['overallStatus'], string> = {
  healthy: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  degraded: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  critical: 'bg-destructive/15 text-destructive',
};

const relativeTime = (isoDate?: string) => {
  if (!isoDate) {
    return 'Never';
  }
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

const AdminOverviewPage: React.FC = () => {
  const { data: systemOverview, isLoading: systemLoading } = useQuery<SystemOverview>({
    queryKey: ['admin', 'system-overview'],
    queryFn: () => adminApi.getSystemOverview(),
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers(),
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  const { data: latestHealth, isLoading: healthLoading } = useQuery<HealthCheckResult | null>({
    queryKey: ['admin', 'health-check'],
    queryFn: () => adminApi.getLatestHealthCheck(),
  });

  const systemStats = useMemo(() => {
    if (!systemOverview) return [];
    return [
      { label: 'Environment', value: systemOverview.environment.toUpperCase() },
      { label: 'Uptime', value: `${systemOverview.uptime.toFixed(2)}%` },
      { label: 'Active incidents', value: systemOverview.incidentsOpen },
      { label: 'Next maintenance', value: new Date(systemOverview.nextMaintenance).toLocaleDateString() },
    ];
  }, [systemOverview]);

  const teamSnapshot = useMemo(() => {
    if (!users) {
      return { total: 0, invited: 0, active: 0 };
    }
    const invited = users.filter(user => user.status === 'invited').length;
    const active = users.filter(user => user.status !== 'invited').length;
    return { total: users.length, invited, active };
  }, [users]);

  const latestAuditEntries = useMemo(() => {
    if (!auditLogs) return [];
    return auditLogs.slice(0, 5);
  }, [auditLogs]);

  const mainAsideGrid = 'grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]';

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-muted-foreground">System overview</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {systemLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={`system-skeleton-${index}`}>
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </CardHeader>
                </Card>
              ))
            : systemStats.map(stat => (
                <Card key={stat.label}>
                  <CardHeader>
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className="text-3xl">{stat.value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
        </div>
      </section>

      <div className={mainAsideGrid}>
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">Team snapshot</CardTitle>
              <CardDescription>Keep track of access and pending invitations.</CardDescription>
            </div>
            <Link
              to="/admin/team"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'self-start md:self-auto')}
            >
              Manage team
            </Link>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={`team-skeleton-${index}`} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total members</p>
                  <p className="mt-1 text-2xl font-semibold">{teamSnapshot.total}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="mt-1 text-2xl font-semibold">{teamSnapshot.active}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Invited</p>
                  <p className="mt-1 text-2xl font-semibold">{teamSnapshot.invited}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl">Health status</CardTitle>
              <CardDescription>The most recent diagnostics snapshot.</CardDescription>
            </div>
            <Link
              to="/admin/diagnostics"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'self-start md:self-auto')}
            >
              View diagnostics
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : latestHealth ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-sm font-medium',
                      healthStatusStyles[latestHealth.overallStatus]
                    )}
                  >
                    {latestHealth.overallStatus.toUpperCase()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Checked {relativeTime(latestHealth.checkedAt)}
                  </span>
                </div>
                <ul className="space-y-2 text-sm">
                  {latestHealth.results.slice(0, 3).map(result => (
                    <li key={result.name} className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{result.name}</span>
                      <Badge variant={result.passed ? 'secondary' : 'destructive'}>
                        {result.passed ? 'Pass' : 'Attention'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No diagnostics have been executed yet. Run your first health check to get insights.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={mainAsideGrid}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Service status</CardTitle>
            <CardDescription>Live operational state for platform dependencies.</CardDescription>
          </CardHeader>
          <CardContent>
            {systemOverview ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Response time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemOverview.services.map(service => (
                      <TableRow key={service.name}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{service.name}</p>
                            {service.dependency && (
                              <p className="text-xs text-muted-foreground">Depends on {service.dependency}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                              serviceStatusBadge[service.status].className
                            )}
                          >
                            {serviceStatusBadge[service.status].label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {service.responseTimeMs} ms
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`service-skeleton-${index}`} className="h-10 w-full" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-xl">Recent audit log</CardTitle>
              <CardDescription>Track sensitive actions executed in the console.</CardDescription>
            </div>
            <Link
              to="/admin/audit"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'self-start md:self-auto')}
            >
              View full log
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {logsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`audit-skeleton-${index}`} className="h-14 w-full" />
                ))}
              </div>
            ) : latestAuditEntries.length > 0 ? (
              <div className="space-y-3">
                {latestAuditEntries.map(log => (
                  <div key={log.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{log.action}</p>
                      <Badge variant={statusColorMap[log.status]} className="uppercase">
                        {log.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {log.actor} → {log.target}
                      </span>
                      <span>{relativeTime(log.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
