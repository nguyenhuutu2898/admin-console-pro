
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status?: 'active' | 'invited' | 'suspended';
  lastActive?: string;
  createdAt?: string;
}

export type SystemEnvironment = 'production' | 'staging' | 'development';

export type ServiceStatus = 'operational' | 'degraded' | 'offline';

export interface SystemServiceStatus {
  name: string;
  status: ServiceStatus;
  responseTimeMs: number;
  dependency?: string;
}

export interface SystemOverview {
  uptime: number;
  version: string;
  lastDeploy: string;
  incidentsOpen: number;
  nextMaintenance: string;
  environment: SystemEnvironment;
  services: SystemServiceStatus[];
}

export type MetricTrend = 'up' | 'down' | 'flat';

export interface CoinMetric {
  id: string;
  label: string;
  value: number;
  unit: 'USD' | 'PCT' | 'COUNT';
  change24h: number;
  trend: MetricTrend;
}

export interface TreasuryAsset {
  asset: string;
  chain: string;
  allocationPct: number;
  balance: number;
  valueUsd: number;
  type: 'Stablecoin' | 'Native' | 'Yield' | 'Liquidity';
  yieldPct?: number;
}

export interface TreasuryLiability {
  label: string;
  amountUsd: number;
  dueDate?: string;
}

export interface TreasurySnapshot {
  totalValueUsd: number;
  change24hPct: number;
  hedgedRatio: number;
  burnRateUsd: number;
  runwayMonths: number;
  insuranceCoverageUsd: number;
  assets: TreasuryAsset[];
  liabilities: TreasuryLiability[];
}

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RiskAlert {
  id: string;
  title: string;
  severity: RiskSeverity;
  description: string;
  detectedAt: string;
  acknowledged: boolean;
  area: 'market' | 'liquidity' | 'security' | 'compliance';
  impact?: string;
}

export interface LiquidityPool {
  id: string;
  pool: string;
  chain: string;
  tvlUsd: number;
  volume24hUsd: number;
  apyPct: number;
  status: 'optimal' | 'watch' | 'critical';
  depthScore: number;
}

export interface MarketMaker {
  id: string;
  name: string;
  region: string;
  status: 'connected' | 'degraded' | 'offline';
  depthScore: number;
  lastHeartbeat: string;
}

export interface WalletActivity {
  id: string;
  wallet: string;
  type: 'mint' | 'burn' | 'transfer' | 'rebalance';
  direction: 'in' | 'out';
  amount: number;
  asset: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  counterparty: string;
  txHash: string;
  chain: string;
}

export interface ComplianceTask {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  category: 'regulation' | 'finance' | 'governance' | 'security';
  progress: number;
  priority: 'low' | 'medium' | 'high';
}

export interface ReleaseEvent {
  id: string;
  title: string;
  asset: string;
  amount: number;
  unlockDate: string;
  cliff: string;
  status: 'scheduled' | 'processing' | 'completed';
  notes?: string;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  status: 'active' | 'passed' | 'failed' | 'draft';
  votingEndsAt: string;
  quorumPct: number;
  supportPct: number;
}

export interface NodeStatus {
  id: string;
  region: string;
  provider: string;
  version: string;
  status: 'healthy' | 'degraded' | 'offline';
  blockHeight: number;
  peers: number;
  latencyMs: number;
}

export interface HealthCheckDetail {
  name: string;
  passed: boolean;
  message: string;
}

export type HealthStatus = 'healthy' | 'degraded' | 'critical';

export interface HealthCheckResult {
  checkedAt: string;
  results: HealthCheckDetail[];
  overallStatus: HealthStatus;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  ipAddress?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalSpent: number;
    joinDate: string;
}

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
