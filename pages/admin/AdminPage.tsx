import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import { InviteUserDialog, type InviteUserSchema } from '../../components/admin/InviteUserDialog';
import { UserRoleSelect } from '../../components/admin/UserRoleSelect';
import { adminApi } from '../../services/api';
import type {
  AuditLogEntry,
  HealthCheckResult,
  SystemOverview,
  User,
  UserRole,
} from '../../types';

const statusColorMap: Record<'success' | 'warning' | 'error', 'default' | 'secondary' | 'destructive'> = {
  success: 'secondary',
  warning: 'default',
  error: 'destructive',
};

const healthStatusStyles: Record<HealthCheckResult['overallStatus'], string> = {
  healthy: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  degraded: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  critical: 'bg-destructive/15 text-destructive',
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) {
    return '—';
  }
  const date = new Date(isoDate);
  return date.toLocaleString();
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

const serviceStatusBadge: Record<'operational' | 'degraded' | 'offline', { label: string; className: string }> = {
  operational: { label: 'Operational', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  degraded: { label: 'Degraded', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  offline: { label: 'Offline', className: 'bg-destructive/10 text-destructive' },
};

const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [latestHealthResult, setLatestHealthResult] = useState<HealthCheckResult | null>(null);

  const { data: systemOverview, isLoading: systemLoading } = useQuery<SystemOverview>({
    queryKey: ['admin', 'system-overview'],
    queryFn: () => adminApi.getSystemOverview(),
  });

  const {
    data: users,
    isLoading: usersLoading,
    isFetching: usersRefreshing,
  } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers(),
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteUserSchema) => adminApi.inviteUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setInviteOpen(false);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminApi.updateUserRole({ userId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const healthCheckMutation = useMutation({
    mutationFn: () => adminApi.runHealthCheck(),
    onSuccess: result => {
      setLatestHealthResult(result);
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
  });

  const systemStats = useMemo(() => {
    if (!systemOverview) return null;
    return [
      { label: 'Uptime', value: `${systemOverview.uptime.toFixed(2)}%` },
      { label: 'Version', value: systemOverview.version },
      { label: 'Incidents', value: systemOverview.incidentsOpen },
      { label: 'Next Maintenance', value: new Date(systemOverview.nextMaintenance).toLocaleDateString() },
      { label: 'Environment', value: systemOverview.environment },
    ];
  }, [systemOverview]);

  const effectiveHealth = latestHealthResult ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">Control centre for teams, infrastructure and security</p>
        </div>
        <div className="flex items-center gap-2">
          {usersRefreshing && <Badge variant="secondary">Syncing data…</Badge>}
          <Badge variant="secondary">ADMIN</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {systemLoading && (
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </>
        )}
        {systemStats?.map(stat => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
        {effectiveHealth && (
          <Card>
            <CardHeader>
              <CardDescription>Last health check</CardDescription>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className={`rounded-full px-2 py-1 text-sm font-medium ${healthStatusStyles[effectiveHealth.overallStatus]}`}>
                  {effectiveHealth.overallStatus.toUpperCase()}
                </span>
                <span className="text-sm font-normal text-muted-foreground">{relativeTime(effectiveHealth.checkedAt)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {effectiveHealth.results.map(result => (
                <div key={result.name} className="flex items-start justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-muted-foreground">{result.message}</p>
                  </div>
                  <Badge variant={result.passed ? 'secondary' : 'destructive'}>
                    {result.passed ? 'Pass' : 'Attention'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Team members</CardTitle>
              <CardDescription>Manage access for everyone working in the console</CardDescription>
            </div>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              Invite user
            </Button>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Skeleton className="h-10 w-[220px]" />
                    <Skeleton className="h-10 w-[140px]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {users?.map(user => (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.status === 'invited' ? 'Invitation pending' : `Last active ${relativeTime(user.lastActive)}`}
                      </p>
                    </div>
                    <UserRoleSelect
                      value={user.role}
                      disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.userId === user.id}
                      onChange={role => updateRoleMutation.mutate({ userId: user.id, role })}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-xl">Run diagnostics</CardTitle>
            <CardDescription>Check integrations and infrastructure health in real time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => healthCheckMutation.mutate()}
              disabled={healthCheckMutation.isPending}
            >
              {healthCheckMutation.isPending ? 'Running health check…' : 'Run health check'}
            </Button>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last executed</span>
                <span>{effectiveHealth ? formatDate(effectiveHealth.checkedAt) : 'Not run yet'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Environment</span>
                <span className="font-medium uppercase">{systemOverview?.environment ?? '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Service status</CardTitle>
            <CardDescription>Live overview of platform services and SLAs</CardDescription>
          </CardHeader>
          <CardContent>
            {systemOverview ? (
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
                        <div>
                          <p className="font-medium">{service.name}</p>
                          {service.dependency && (
                            <p className="text-xs text-muted-foreground">Depends on {service.dependency}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${serviceStatusBadge[service.status].className}`}>
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
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-xl">Audit log</CardTitle>
              <CardDescription>Track sensitive operations inside the console</CardDescription>
            </div>
            <Badge variant="secondary">{auditLogs?.length ?? 0} events</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {logsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : auditLogs && auditLogs.length > 0 ? (
              <div className="space-y-3">
                {auditLogs.slice(0, 6).map(log => (
                  <div key={log.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{log.action}</p>
                      <Badge variant={statusColorMap[log.status]} className="uppercase">
                        {log.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{log.actor} → {log.target}</span>
                      <span>{relativeTime(log.timestamp)}</span>
                    </div>
                    {log.ipAddress && (
                      <p className="mt-1 text-xs text-muted-foreground">IP {log.ipAddress}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No audit events recorded.</p>
            )}
            <Button variant="secondary" className="w-full">
              View full audit trail
            </Button>
          </CardContent>
        </Card>
      </div>

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={values => inviteMutation.mutate(values)}
        isSubmitting={inviteMutation.isPending}
      />
    </div>
  );
};

export default AdminPage;
