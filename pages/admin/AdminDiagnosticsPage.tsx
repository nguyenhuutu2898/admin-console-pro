import React from 'react';
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
import { cn } from '../../lib/utils';
import { adminApi } from '../../services/api';
import type { HealthCheckResult, SystemOverview } from '../../types';

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

const AdminDiagnosticsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: systemOverview, isLoading: systemLoading } = useQuery<SystemOverview>({
    queryKey: ['admin', 'system-overview'],
    queryFn: () => adminApi.getSystemOverview(),
  });

  const {
    data: latestHealth,
    isLoading: healthLoading,
    isFetching: healthRefreshing,
  } = useQuery<HealthCheckResult | null>({
    queryKey: ['admin', 'health-check'],
    queryFn: () => adminApi.getLatestHealthCheck(),
  });

  const healthCheckMutation = useMutation({
    mutationFn: () => adminApi.runHealthCheck(),
    onSuccess: result => {
      queryClient.setQueryData(['admin', 'health-check'], result);
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
  });

  const effectiveHealth = healthCheckMutation.isSuccess ? healthCheckMutation.data : latestHealth;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Run diagnostics</CardTitle>
            <CardDescription>
              Execute platform checks for databases, integrations and authentication services.
            </CardDescription>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => healthCheckMutation.mutate()}
            disabled={healthCheckMutation.isPending}
          >
            {healthCheckMutation.isPending ? 'Running health check…' : 'Run health check'}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Last executed</p>
            {healthLoading && !effectiveHealth ? (
              <Skeleton className="mt-2 h-5 w-32" />
            ) : (
              <p className="mt-2 font-semibold">
                {effectiveHealth ? relativeTime(effectiveHealth.checkedAt) : 'Not run yet'}
              </p>
            )}
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Environment</p>
            {systemLoading ? (
              <Skeleton className="mt-2 h-5 w-28" />
            ) : (
              <p className="mt-2 font-semibold uppercase">{systemOverview?.environment ?? '—'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Results</CardTitle>
          <CardDescription>
            Review each subsystem and address warnings to keep the platform healthy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthLoading && !effectiveHealth ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`health-skeleton-${index}`} className="h-16 w-full" />
              ))}
            </div>
          ) : effectiveHealth ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-medium',
                    healthStatusStyles[effectiveHealth.overallStatus]
                  )}
                >
                  {effectiveHealth.overallStatus.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">
                  Checked {relativeTime(effectiveHealth.checkedAt)}
                </span>
                {healthRefreshing && <Badge variant="secondary">Refreshing…</Badge>}
              </div>
              <div className="grid gap-3">
                {effectiveHealth.results.map(result => (
                  <div
                    key={result.name}
                    className="rounded-md border p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{result.name}</p>
                      <Badge variant={result.passed ? 'secondary' : 'destructive'}>
                        {result.passed ? 'Pass' : 'Needs attention'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{result.message}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Run a health check to populate diagnostics insights for your services.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDiagnosticsPage;
