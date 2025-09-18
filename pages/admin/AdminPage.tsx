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
import PageHeader from '../../components/layout/PageHeader';
import { adminApi } from '../../services/api';
import type {
  AuditLogEntry,
  CoinMetric,
  ComplianceTask,
  GovernanceProposal,
  HealthCheckResult,
  LiquidityPool,
  MarketMaker,
  NodeStatus,
  RiskAlert,
  SystemOverview,
  TreasurySnapshot,
  User,
  UserRole,
  WalletActivity,
  ReleaseEvent,
} from '../../types';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building,
  Clock,
  Coins,
  Globe,
  Wallet as WalletIcon,
} from '../../components/Icons';

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

const riskSeverityStyles: Record<RiskAlert['severity'], string> = {
  low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  high: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  critical: 'bg-destructive/15 text-destructive',
};

const poolStatusStyles: Record<LiquidityPool['status'], string> = {
  optimal: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  watch: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  critical: 'bg-destructive/10 text-destructive',
};

const makerStatusStyles: Record<MarketMaker['status'], string> = {
  connected: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  degraded: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  offline: 'bg-destructive/10 text-destructive',
};

const nodeStatusStyles: Record<NodeStatus['status'], string> = {
  healthy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  degraded: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  offline: 'bg-destructive/10 text-destructive',
};

const complianceStatusStyles: Record<ComplianceTask['status'], string> = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blocked: 'bg-destructive/10 text-destructive',
};

const priorityStyles: Record<ComplianceTask['priority'], string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  high: 'bg-destructive/10 text-destructive',
};

const walletStatusStyles: Record<WalletActivity['status'], string> = {
  completed: 'text-emerald-600 dark:text-emerald-400',
  pending: 'text-amber-600 dark:text-amber-400',
  failed: 'text-destructive',
};

const serviceStatusBadge: Record<'operational' | 'degraded' | 'offline', { label: string; className: string }> = {
  operational: { label: 'Operational', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  degraded: { label: 'Degraded', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  offline: { label: 'Offline', className: 'bg-destructive/10 text-destructive' },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000 ? 1 : 2,
  }).format(value);

const formatPercent = (value: number, fractionDigits = 1) => `${(value * 100).toFixed(fractionDigits)}%`;

const formatChange = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

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
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} mo${months > 1 ? 's' : ''} ago`;
};

const metricValue = (metric: CoinMetric) => {
  switch (metric.unit) {
    case 'USD':
      return formatCurrency(metric.value);
    case 'PCT':
      return formatPercent(metric.value);
    case 'COUNT':
    default:
      return metric.value.toLocaleString();
  }
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

  const { data: metrics, isLoading: metricsLoading } = useQuery<CoinMetric[]>({
    queryKey: ['admin', 'coin-metrics'],
    queryFn: () => adminApi.getCoinMetrics(),
  });

  const { data: treasury, isLoading: treasuryLoading } = useQuery<TreasurySnapshot>({
    queryKey: ['admin', 'treasury'],
    queryFn: () => adminApi.getTreasurySnapshot(),
  });

  const { data: pools, isLoading: poolsLoading } = useQuery<LiquidityPool[]>({
    queryKey: ['admin', 'liquidity-pools'],
    queryFn: () => adminApi.getLiquidityPools(),
  });

  const { data: makers, isLoading: makersLoading } = useQuery<MarketMaker[]>({
    queryKey: ['admin', 'market-makers'],
    queryFn: () => adminApi.getMarketMakers(),
  });

  const { data: nodes, isLoading: nodesLoading } = useQuery<NodeStatus[]>({
    queryKey: ['admin', 'nodes'],
    queryFn: () => adminApi.getNodeStatus(),
  });

  const { data: riskAlerts, isLoading: riskLoading } = useQuery<RiskAlert[]>({
    queryKey: ['admin', 'risk-alerts'],
    queryFn: () => adminApi.getRiskAlerts(),
  });

  const { data: complianceTasks, isLoading: complianceLoading } = useQuery<ComplianceTask[]>({
    queryKey: ['admin', 'compliance'],
    queryFn: () => adminApi.getComplianceTasks(),
  });

  const { data: walletActivities, isLoading: walletLoading } = useQuery<WalletActivity[]>({
    queryKey: ['admin', 'wallet-activity'],
    queryFn: () => adminApi.getWalletActivity(),
  });

  const { data: releaseEvents, isLoading: releaseLoading } = useQuery<ReleaseEvent[]>({
    queryKey: ['admin', 'release-schedule'],
    queryFn: () => adminApi.getReleaseSchedule(),
  });

  const { data: governanceProposals, isLoading: governanceLoading } = useQuery<GovernanceProposal[]>({
    queryKey: ['admin', 'governance'],
    queryFn: () => adminApi.getGovernanceProposals(),
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

  const metricCards = metricsLoading ? Array.from({ length: 6 }, () => null) : metrics ?? [];
  const mainAsideGrid = 'grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]';

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
      <PageHeader
        title="Admin Console"
        description="Control centre for teams, treasury and security of the COIN ecosystem"
        actions={
          <>
            {usersRefreshing ? <Badge variant="secondary">Syncing data…</Badge> : null}
            <Badge variant="secondary">ADMIN</Badge>
          </>
        }
        titleSectionClassName="space-y-2"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((metric, index) => (
          <Card key={metric?.id ?? index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wide">
                <Coins className="h-4 w-4" />
                {metric?.label ?? <Skeleton className="h-4 w-24" />}
              </CardDescription>
              {!metric && <Skeleton className="h-6 w-6" />}
              {metric && (
                metric.trend === 'up' ? (
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                ) : metric.trend === 'down' ? (
                  <ArrowDownRight className="h-5 w-5 text-destructive" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )
              )}
            </CardHeader>
            <CardContent>
              {metric ? (
                <>
                  <div className="text-2xl font-bold">{metricValue(metric)}</div>
                  <p className={`text-xs font-medium ${metric.change24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                    {formatChange(metric.change24h)} last 24h
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={mainAsideGrid}>
        <Card>
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Treasury snapshot</CardTitle>
              <CardDescription>Real-time composition of reserves backing COIN</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Globe className="h-4 w-4" /> Hedged {treasury ? formatPercent(treasury.hedgedRatio, 0) : '—'}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Building className="h-4 w-4" /> Insurance {treasury ? formatCurrency(treasury.insuranceCoverageUsd) : '—'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {treasuryLoading || !treasury ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Total value</p>
                    <p className="text-2xl font-semibold">{formatCurrency(treasury.totalValueUsd)}</p>
                    <p className={`text-xs ${treasury.change24hPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                      {formatChange(treasury.change24hPct)} vs 24h
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Burn rate</p>
                    <p className="text-2xl font-semibold">{formatCurrency(treasury.burnRateUsd)}/mo</p>
                    <p className="text-xs text-muted-foreground">Runway {treasury.runwayMonths} months</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Stablecoins</p>
                    <p className="text-2xl font-semibold">
                      {formatPercent(
                        treasury.assets.filter(asset => asset.type === 'Stablecoin').reduce((sum, asset) => sum + asset.allocationPct, 0),
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Across {treasury.assets.length} holdings</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Yielding assets</p>
                    <p className="text-2xl font-semibold">
                      {formatPercent(
                        treasury.assets.filter(asset => typeof asset.yieldPct === 'number').reduce((sum, asset) => sum + asset.allocationPct, 0),
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg APY {(treasury.assets.reduce((sum, asset) => sum + (asset.yieldPct ?? 0) * asset.allocationPct, 0) /
                      Math.max(
                        treasury.assets.filter(asset => typeof asset.yieldPct === 'number').reduce((sum, asset) => sum + asset.allocationPct, 0),
                        1,
                      )).toFixed(2)}%</p>
                  </div>
                </div>

                <div className={mainAsideGrid}>
                  <div className="space-y-4">
                    {treasury.assets.map(asset => (
                      <div key={asset.asset} className="rounded-md border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{asset.asset}</p>
                            <p className="text-xs text-muted-foreground">{asset.chain} · {asset.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatCurrency(asset.valueUsd)}</p>
                            <p className="text-xs text-muted-foreground">{(asset.allocationPct * 100).toFixed(1)}% of reserves</p>
                          </div>
                        </div>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${Math.max(asset.allocationPct * 100, 6)}%` }}
                          />
                        </div>
                        {typeof asset.yieldPct === 'number' && (
                          <p className="mt-2 text-xs text-muted-foreground">Earning {(asset.yieldPct * 100).toFixed(1)}% APY</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg border bg-muted/40 p-4">
                      <p className="text-xs uppercase text-muted-foreground">Liabilities</p>
                      <div className="mt-3 space-y-3 text-sm">
                        {treasury.liabilities.map(liability => (
                          <div key={liability.label} className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{liability.label}</p>
                              {liability.dueDate && <p className="text-xs text-muted-foreground">Due {new Date(liability.dueDate).toLocaleDateString()}</p>}
                            </div>
                            <p>{formatCurrency(liability.amountUsd)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {effectiveHealth && (
                      <div className="rounded-lg border bg-muted/40 p-4">
                        <p className="text-xs uppercase text-muted-foreground">Last diagnostics</p>
                        <p className="mt-1 text-sm font-medium">
                          {effectiveHealth.overallStatus.toUpperCase()} · {relativeTime(effectiveHealth.checkedAt)}
                        </p>
                        <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                          {effectiveHealth.results.slice(0, 3).map(result => (
                            <li key={result.name} className="flex items-center justify-between gap-2">
                              <span>{result.name}</span>
                              <Badge variant={result.passed ? 'secondary' : 'destructive'} className="text-[10px] uppercase">
                                {result.passed ? 'pass' : 'attention'}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-xl">Risk alerts</CardTitle>
            <CardDescription>High-signal items across market, liquidity and compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : riskAlerts && riskAlerts.length > 0 ? (
              riskAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <Badge className={riskSeverityStyles[alert.severity]}>{alert.severity.toUpperCase()}</Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> {alert.area}
                    </span>
                    <span>{relativeTime(alert.detectedAt)}</span>
                  </div>
                  {alert.impact && <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">{alert.impact}</p>}
                  {alert.acknowledged && <p className="mt-1 text-[10px] uppercase text-muted-foreground">Acknowledged</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No active risks. Monitoring all systems.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={mainAsideGrid}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Liquidity pools</CardTitle>
            <CardDescription>Depth and utilisation across major venues</CardDescription>
          </CardHeader>
          <CardContent>
            {poolsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : pools ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool</TableHead>
                    <TableHead>TVL</TableHead>
                    <TableHead>24h volume</TableHead>
                    <TableHead>APY</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pools.map(pool => (
                    <TableRow key={pool.id}>
                      <TableCell>
                        <div className="font-medium">{pool.pool}</div>
                        <div className="text-xs text-muted-foreground">{pool.chain}</div>
                      </TableCell>
                      <TableCell className="text-sm">{formatCurrency(pool.tvlUsd)}</TableCell>
                      <TableCell className="text-sm">{formatCurrency(pool.volume24hUsd)}</TableCell>
                      <TableCell className="text-sm">{(pool.apyPct * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${poolStatusStyles[pool.status]}`}>
                          {pool.status.toUpperCase()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No pools found.</p>
            )}
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-col gap-2">
              <CardTitle className="text-xl">Market makers</CardTitle>
              <CardDescription>Connectivity and liquidity depth by partner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {makersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : makers ? (
                makers.map(maker => (
                  <div key={maker.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{maker.name}</p>
                        <p className="text-xs text-muted-foreground">{maker.region}</p>
                      </div>
                      <Badge className={makerStatusStyles[maker.status]}>{maker.status.toUpperCase()}</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Depth score {maker.depthScore}</span>
                      <span>{relativeTime(maker.lastHeartbeat)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No market makers configured.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2">
              <CardTitle className="text-xl">Node operations</CardTitle>
              <CardDescription>Validator performance across geographies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nodesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : nodes ? (
                nodes.map(node => (
                  <div key={node.id} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{node.region}</p>
                        <p className="text-xs text-muted-foreground">{node.provider} · {node.version}</p>
                      </div>
                      <Badge className={nodeStatusStyles[node.status]}>{node.status.toUpperCase()}</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span>Height {node.blockHeight.toLocaleString()}</span>
                      <span>Peers {node.peers}</span>
                      <span>Latency {node.latencyMs} ms</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No nodes reporting.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className={mainAsideGrid}>
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Wallet activity</CardTitle>
              <CardDescription>Latest treasury, mint and burn operations</CardDescription>
            </div>
            <WalletIcon className="h-8 w-8 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {walletLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : walletActivities ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Counterparty</TableHead>
                    <TableHead className="hidden xl:table-cell">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletActivities.map(activity => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="font-medium">{activity.wallet}</div>
                        <div className="text-xs text-muted-foreground">{activity.chain}</div>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{activity.type}</TableCell>
                      <TableCell className="text-sm">
                        {activity.direction === 'out' ? '-' : '+'}
                        {formatCurrency(activity.amount)} {activity.asset}
                      </TableCell>
                      <TableCell className={`text-sm font-medium ${walletStatusStyles[activity.status]}`}>
                        {activity.status}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{activity.counterparty}</TableCell>
                      <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                        {relativeTime(activity.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No recent wallet activity.</p>
            )}
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-col gap-2">
              <CardTitle className="text-xl">Compliance tasks</CardTitle>
              <CardDescription>Deadlines and regulatory obligations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {complianceLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : complianceTasks ? (
                complianceTasks.map(task => (
                  <div key={task.id} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Owner {task.owner}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={priorityStyles[task.priority]}>{task.priority.toUpperCase()}</Badge>
                        <Badge className={complianceStatusStyles[task.status]}>{task.status.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Due {new Date(task.dueDate).toLocaleDateString()} · {task.category}
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">All compliance tasks completed.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2">
              <CardTitle className="text-xl">Governance</CardTitle>
              <CardDescription>Active and recent proposals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {governanceLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : governanceProposals ? (
                governanceProposals.map(proposal => (
                  <div key={proposal.id} className="rounded-md border p-3 text-sm">
                    <p className="font-semibold">{proposal.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {proposal.status.toUpperCase()} · Ends {new Date(proposal.votingEndsAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>Quorum {formatPercent(proposal.quorumPct, 0)}</span>
                      <span>Support {formatPercent(proposal.supportPct, 0)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No proposals yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className={mainAsideGrid}>
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

      <div className={mainAsideGrid}>
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
                {systemLoading
                  ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)
                  : <p className="text-sm text-muted-foreground">No service data.</p>}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Token release schedule</CardTitle>
              <CardDescription>Upcoming unlocks and vesting milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {releaseLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : releaseEvents ? (
                releaseEvents.map(event => (
                  <div key={event.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.asset} · {formatCurrency(event.amount)}</p>
                      </div>
                      <Badge variant={event.status === 'completed' ? 'secondary' : 'default'}>{event.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Unlocks {new Date(event.unlockDate).toLocaleDateString()} ({event.cliff})</p>
                    {event.notes && <p className="mt-1 text-xs text-muted-foreground">{event.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No unlocks scheduled.</p>
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
                        <span>
                          {log.actor} → {log.target}
                        </span>
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
