
import {
  UserRole,
  type Order,
  type Product,
  type Customer,
  type User,
  type PaginatedResponse,
  type SystemOverview,
  type SystemServiceStatus,
  type HealthCheckResult,
  type AuditLogEntry,
  type CoinMetric,
  type TreasurySnapshot,
  type RiskAlert,
  type LiquidityPool,
  type ComplianceTask,
  type WalletActivity,
  type ReleaseEvent,
  type GovernanceProposal,
  type MarketMaker,
  type NodeStatus,
} from '../types';
import { toast } from 'sonner';

// --- DATA LOADING FROM PUBLIC JSON ---
let cachedProducts: Product[] | null = null;
let cachedOrders: Order[] | null = null;
let cachedCustomers: Customer[] | null = null;
const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@gmail.com', role: UserRole.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=admin', status: 'active', lastActive: new Date().toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString() },
  { id: '2', name: 'Staff User', email: 'staff@gmail.com', role: UserRole.STAFF, avatarUrl: 'https://i.pravatar.cc/150?u=staff', status: 'active', lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString() },
  { id: '3', name: 'Viewer User', email: 'viewer@gmail.com', role: UserRole.VIEWER, avatarUrl: 'https://i.pravatar.cc/150?u=viewer', status: 'active', lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
];

async function loadProducts(): Promise<Product[]> {
  if (cachedProducts) return cachedProducts;
  const res = await fetch('/data/products.json');
  cachedProducts = await res.json();
  return cachedProducts!;
}

async function loadOrders(): Promise<Order[]> {
  if (cachedOrders) return cachedOrders;
  const res = await fetch('/data/orders.json');
  cachedOrders = await res.json();
  return cachedOrders!;
}

async function loadCustomers(): Promise<Customer[]> {
  if (cachedCustomers) return cachedCustomers;
  const res = await fetch('/data/customers.json');
  cachedCustomers = await res.json();
  return cachedCustomers!;
}


const systemServices: SystemServiceStatus[] = [
    { name: 'API Gateway', status: 'operational', responseTimeMs: 182 },
    { name: 'Authentication', status: 'operational', responseTimeMs: 146, dependency: 'Identity Provider' },
    { name: 'Payments', status: 'degraded', responseTimeMs: 421, dependency: 'Stripe API' },
    { name: 'Notifications', status: 'operational', responseTimeMs: 205, dependency: 'Firebase Cloud Messaging' },
    { name: 'Reporting', status: 'operational', responseTimeMs: 264 },
];

const auditLogs: AuditLogEntry[] = Array.from({ length: 12 }, (_, index) => {
    const timestamp = new Date(Date.now() - index * 1000 * 60 * 45).toISOString();
    const actions = [
        ['User Login', 'Admin User', 'self-service login', 'success'],
        ['Role Updated', 'Admin User', 'Staff User', 'warning'],
        ['Password Reset', 'Staff User', 'Viewer User', 'success'],
        ['Export Data', 'Admin User', 'Orders', 'success'],
        ['Failed Login', 'Viewer User', 'self-service login', 'error'],
    ] as const;
    const [action, actor, target, status] = actions[index % actions.length];
    return {
        id: `log-${index + 1}`,
        action,
        actor,
        target,
        timestamp,
        status,
        ipAddress: `10.0.0.${index + 10}`,
    } satisfies AuditLogEntry;
});

// Using JSON loaders instead of in-memory mock arrays. The data is loaded by loadProducts, loadOrders, and loadCustomers.

const metricsNow = Date.now();

const coinMetrics: CoinMetric[] = [
    { id: 'price', label: 'Token price', value: 1.34, unit: 'USD', change24h: 2.6, trend: 'up' },
    { id: 'marketCap', label: 'Market cap', value: 382_000_000, unit: 'USD', change24h: -1.8, trend: 'down' },
    { id: 'circulating', label: 'Circulating supply', value: 274_000_000, unit: 'COUNT', change24h: 0.5, trend: 'up' },
    { id: 'staked', label: 'Staked ratio', value: 0.61, unit: 'PCT', change24h: 1.2, trend: 'up' },
    { id: 'volume', label: '24h volume', value: 21_400_000, unit: 'USD', change24h: 6.4, trend: 'up' },
    { id: 'volatility', label: '30d volatility', value: 0.24, unit: 'PCT', change24h: -0.7, trend: 'down' },
];

const treasurySnapshot: TreasurySnapshot = {
    totalValueUsd: 188_500_000,
    change24hPct: 1.9,
    hedgedRatio: 0.67,
    burnRateUsd: 4_200_000,
    runwayMonths: 28,
    insuranceCoverageUsd: 92_000_000,
    assets: [
        { asset: 'USDC', chain: 'Ethereum', allocationPct: 0.32, balance: 60_500_000, valueUsd: 60_500_000, type: 'Stablecoin', yieldPct: 0.035 },
        { asset: 'ETH', chain: 'Ethereum', allocationPct: 0.18, balance: 15_800, valueUsd: 48_300_000, type: 'Native' },
        { asset: 'stETH', chain: 'Ethereum', allocationPct: 0.22, balance: 13_400, valueUsd: 41_900_000, type: 'Yield', yieldPct: 0.045 },
        { asset: 'COIN-USD LP', chain: 'Solana', allocationPct: 0.12, balance: 9_600_000, valueUsd: 22_600_000, type: 'Liquidity', yieldPct: 0.082 },
        { asset: 'USDT', chain: 'Polygon', allocationPct: 0.08, balance: 12_400_000, valueUsd: 12_400_000, type: 'Stablecoin' },
        { asset: 'BTC', chain: 'Bitcoin', allocationPct: 0.08, balance: 1_150, valueUsd: 22_800_000, type: 'Native' },
    ],
    liabilities: [
        { label: 'Market maker credit line', amountUsd: 18_000_000, dueDate: new Date(metricsNow + 1000 * 60 * 60 * 24 * 45).toISOString() },
        { label: 'Operational expenses (30d)', amountUsd: 4_800_000 },
    ],
};

const liquidityPools: LiquidityPool[] = [
    { id: 'lp-1', pool: 'COIN/USDC', chain: 'Ethereum', tvlUsd: 32_800_000, volume24hUsd: 5_400_000, apyPct: 0.087, status: 'optimal', depthScore: 92 },
    { id: 'lp-2', pool: 'COIN/USDT', chain: 'Polygon', tvlUsd: 14_200_000, volume24hUsd: 1_800_000, apyPct: 0.063, status: 'watch', depthScore: 78 },
    { id: 'lp-3', pool: 'COIN/SOL', chain: 'Solana', tvlUsd: 9_600_000, volume24hUsd: 1_100_000, apyPct: 0.098, status: 'optimal', depthScore: 85 },
    { id: 'lp-4', pool: 'COIN/BTC', chain: 'Arbitrum', tvlUsd: 6_800_000, volume24hUsd: 950_000, apyPct: 0.071, status: 'watch', depthScore: 73 },
];

const marketMakers: MarketMaker[] = [
    { id: 'mm-1', name: 'FalconX', region: 'US', status: 'connected', depthScore: 94, lastHeartbeat: new Date(metricsNow - 1000 * 60 * 3).toISOString() },
    { id: 'mm-2', name: 'Wintermute', region: 'EU', status: 'connected', depthScore: 91, lastHeartbeat: new Date(metricsNow - 1000 * 60 * 5).toISOString() },
    { id: 'mm-3', name: 'Amber', region: 'APAC', status: 'degraded', depthScore: 76, lastHeartbeat: new Date(metricsNow - 1000 * 60 * 19).toISOString() },
];

const nodeStatuses: NodeStatus[] = [
    { id: 'node-1', region: 'US-East', provider: 'AWS', version: 'v1.18.4', status: 'healthy', blockHeight: 18_453_221, peers: 48, latencyMs: 43 },
    { id: 'node-2', region: 'EU-West', provider: 'GCP', version: 'v1.18.4', status: 'healthy', blockHeight: 18_453_217, peers: 52, latencyMs: 51 },
    { id: 'node-3', region: 'APAC', provider: 'Azure', version: 'v1.18.3', status: 'degraded', blockHeight: 18_452_998, peers: 36, latencyMs: 82 },
];

const riskAlerts: RiskAlert[] = [
    {
        id: 'risk-1',
        title: 'Liquidity coverage below policy on Polygon',
        severity: 'medium',
        description: 'Utilisation reached 92% of available liquidity bands. Consider rebalancing stablecoin reserves.',
        detectedAt: new Date(metricsNow - 1000 * 60 * 45).toISOString(),
        acknowledged: false,
        area: 'liquidity',
        impact: 'Coverage 92% (target 105%)',
    },
    {
        id: 'risk-2',
        title: 'Increased volatility vs BTC',
        severity: 'high',
        description: '30d beta climbed to 1.42 indicating outsized swings vs benchmark.',
        detectedAt: new Date(metricsNow - 1000 * 60 * 60 * 5).toISOString(),
        acknowledged: true,
        area: 'market',
        impact: 'Potential slippage for large orders',
    },
    {
        id: 'risk-3',
        title: 'Staking validator downtime',
        severity: 'low',
        description: 'Validator asia-3 experienced 0.4% downtime in the last epoch.',
        detectedAt: new Date(metricsNow - 1000 * 60 * 30).toISOString(),
        acknowledged: false,
        area: 'security',
    },
    {
        id: 'risk-4',
        title: 'KYC refresh overdue for market maker',
        severity: 'medium',
        description: 'Annual compliance review pending for Amber (APAC).',
        detectedAt: new Date(metricsNow - 1000 * 60 * 60 * 24 * 3).toISOString(),
        acknowledged: true,
        area: 'compliance',
    },
];

const complianceTasks: ComplianceTask[] = [
    { id: 'comp-1', title: 'File MAS quarterly report', owner: 'J. Goh', dueDate: new Date(metricsNow + 1000 * 60 * 60 * 24 * 6).toISOString(), status: 'in_progress', category: 'regulation', progress: 65, priority: 'high' },
    { id: 'comp-2', title: 'Audit smart-contract upgradability', owner: 'D. Alvarez', dueDate: new Date(metricsNow + 1000 * 60 * 60 * 24 * 14).toISOString(), status: 'not_started', category: 'security', progress: 0, priority: 'medium' },
    { id: 'comp-3', title: 'Treasury reconciliation', owner: 'M. Chen', dueDate: new Date(metricsNow + 1000 * 60 * 60 * 24 * 3).toISOString(), status: 'in_progress', category: 'finance', progress: 45, priority: 'high' },
    { id: 'comp-4', title: 'DAO vote disclosure', owner: 'A. Rossi', dueDate: new Date(metricsNow + 1000 * 60 * 60 * 24 * 9).toISOString(), status: 'completed', category: 'governance', progress: 100, priority: 'low' },
];

const walletActivity: WalletActivity[] = [
    {
        id: 'tx-1',
        wallet: 'Treasury-1',
        type: 'rebalance',
        direction: 'out',
        amount: 2_500_000,
        asset: 'USDC',
        timestamp: new Date(metricsNow - 1000 * 60 * 12).toISOString(),
        status: 'completed',
        counterparty: 'MM - FalconX',
        txHash: '0x7f6c...a921',
        chain: 'Ethereum',
    },
    {
        id: 'tx-2',
        wallet: 'Treasury-2',
        type: 'mint',
        direction: 'out',
        amount: 1_200_000,
        asset: 'COIN',
        timestamp: new Date(metricsNow - 1000 * 60 * 60 * 2).toISOString(),
        status: 'completed',
        counterparty: 'Custody - Anchorage',
        txHash: '0x81af...c24e',
        chain: 'Ethereum',
    },
    {
        id: 'tx-3',
        wallet: 'Reserves-3',
        type: 'transfer',
        direction: 'in',
        amount: 750_000,
        asset: 'USDT',
        timestamp: new Date(metricsNow - 1000 * 60 * 90).toISOString(),
        status: 'pending',
        counterparty: 'CEX - Binance',
        txHash: '0x95bc...2d10',
        chain: 'Polygon',
    },
    {
        id: 'tx-4',
        wallet: 'Insurance-1',
        type: 'transfer',
        direction: 'in',
        amount: 480_000,
        asset: 'USDC',
        timestamp: new Date(metricsNow - 1000 * 60 * 60 * 4).toISOString(),
        status: 'completed',
        counterparty: 'Insurance fund',
        txHash: '0xb4d8...9f31',
        chain: 'Ethereum',
    },
];

const releaseSchedule: ReleaseEvent[] = [
    { id: 'rel-1', title: 'Team unlock - tranche 3', asset: 'COIN', amount: 5_000_000, unlockDate: new Date(metricsNow + 1000 * 60 * 60 * 24 * 15).toISOString(), cliff: 'No cliff', status: 'scheduled', notes: 'Linear release over 30 days' },
    { id: 'rel-2', title: 'Community incentives', asset: 'COIN', amount: 2_500_000, unlockDate: new Date(metricsNow + 1000 * 60 * 60 * 24 * 45).toISOString(), cliff: '30d cliff', status: 'scheduled' },
    { id: 'rel-3', title: 'Market maker refresh', asset: 'COIN', amount: 1_000_000, unlockDate: new Date(metricsNow - 1000 * 60 * 60 * 24 * 10).toISOString(), cliff: 'Completed', status: 'completed' },
];

const governanceProposals: GovernanceProposal[] = [
    { id: 'gov-1', title: 'Proposal #42: Treasury diversification', status: 'active', votingEndsAt: new Date(metricsNow + 1000 * 60 * 60 * 24 * 2).toISOString(), quorumPct: 0.62, supportPct: 0.54 },
    { id: 'gov-2', title: 'Proposal #41: Validator rewards adjustment', status: 'passed', votingEndsAt: new Date(metricsNow - 1000 * 60 * 60 * 24 * 6).toISOString(), quorumPct: 0.58, supportPct: 0.66 },
    { id: 'gov-3', title: 'Proposal #40: Ecosystem grants wave 5', status: 'draft', votingEndsAt: new Date(metricsNow + 1000 * 60 * 60 * 24 * 12).toISOString(), quorumPct: 0.0, supportPct: 0.0 },
];

// --- MOCK API FUNCTIONS ---

// A helper to simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Service ---
export const authApi = {
  login: async (email: string, password_not_used: string): Promise<{ token: string; user: User }> => {
    await sleep(500);
    const user = users.find(u => u.email === email);
    if (user) {
        toast.success(`Welcome back, ${user.name}!`);
        return { token: `mock-jwt-token-for-${user.id}`, user };
    }
    toast.error('Invalid credentials. Please try again.');
    throw new Error('Invalid credentials');
  },
};

// --- Dashboard Service ---
export const dashboardApi = {
    getKpis: async () => {
        await sleep(800);
        const allOrders = await loadOrders();
        return {
            totalUsers: users.length,
            totalOrders: allOrders.length,
            totalRevenue: allOrders.reduce((sum, o) => sum + o.total, 0),
            uptime: 99.98,
        };
    }
}

// --- Orders Service ---
export const ordersApi = {
  getOrders: async ({ page = 1, limit = 10, q = '', status = '', fromDate, toDate }: { page?: number; limit?: number; q?: string; status?: string; fromDate?: string; toDate?: string; }): Promise<PaginatedResponse<Order>> => {
    await sleep(600);
    let filteredOrders = await loadOrders();

    if (q) {
      filteredOrders = filteredOrders.filter(order =>
        order.id.toLowerCase().includes(q.toLowerCase()) ||
        order.customerName.toLowerCase().includes(q.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(q.toLowerCase())
      );
    }
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    if (fromDate) {
      filteredOrders = filteredOrders.filter(order => order.date >= fromDate);
    }
    if (toDate) {
      filteredOrders = filteredOrders.filter(order => order.date <= toDate);
    }

    const total = filteredOrders.length;
    const data = filteredOrders.slice((page - 1) * limit, page * limit);

    return { data, total, page, limit };
  },
};

// --- Products Service ---
export const productsApi = {
  getProducts: async ({ page = 1, limit = 10, q = '', category = '' }): Promise<PaginatedResponse<Product>> => {
    await sleep(600);
    let filteredProducts = await loadProducts();

    if (q) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    }
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    const total = filteredProducts.length;
    const data = filteredProducts.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  },
  getCategories: async (): Promise<string[]> => {
    const all = await loadProducts();
    return Array.from(new Set(all.map(p => p.category)));
  },
  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    await sleep(500);
    const newProduct: Product = {
      id: `PROD-${Date.now()}`,
      ...productData,
    };
    const current = await loadProducts();
    cachedProducts = [newProduct, ...current];
    toast.success("Product created successfully!");
    return newProduct;
  },
  updateProduct: async (productData: Product): Promise<Product> => {
    await sleep(500);
    const current = await loadProducts();
    const index = current.findIndex(p => p.id === productData.id);
    if (index !== -1) {
      current[index] = productData;
      cachedProducts = [...current];
      toast.success("Product updated successfully!");
      return current[index];
    }
    toast.error("Product not found.");
    throw new Error('Product not found');
  },
};

// --- Customers Service ---
export const customersApi = {
  getCustomers: async ({ page = 1, limit = 10, q = '', minSpent, maxSpent, fromJoinDate, toJoinDate }: { page?: number; limit?: number; q?: string; minSpent?: number; maxSpent?: number; fromJoinDate?: string; toJoinDate?: string; }): Promise<PaginatedResponse<Customer>> => {
    await sleep(700);
    let filteredCustomers = await loadCustomers();

    if (q) {
      filteredCustomers = filteredCustomers.filter(c =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.email.toLowerCase().includes(q.toLowerCase())
      );
    }
    if (typeof minSpent === 'number') {
      filteredCustomers = filteredCustomers.filter(c => c.totalSpent >= minSpent);
    }
    if (typeof maxSpent === 'number') {
      filteredCustomers = filteredCustomers.filter(c => c.totalSpent <= maxSpent);
    }
    if (fromJoinDate) {
      filteredCustomers = filteredCustomers.filter(c => c.joinDate >= fromJoinDate);
    }
    if (toJoinDate) {
      filteredCustomers = filteredCustomers.filter(c => c.joinDate <= toJoinDate);
    }
    
    const total = filteredCustomers.length;
    const data = filteredCustomers.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  },
};

// --- Admin Service ---
const createAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...entry,
    };
    auditLogs.unshift(newEntry);
    return newEntry;
};

const computeHealthStatus = (results: HealthCheckResult['results']): HealthCheckResult['overallStatus'] => {
    const totalFailures = results.filter(result => !result.passed).length;
    if (totalFailures === 0) {
        return 'healthy';
    }
    if (totalFailures === results.length || totalFailures > 2) {
        return 'critical';
    }
    return 'degraded';
};

export const adminApi = {
    getUsers: async (): Promise<User[]> => {
        await sleep(400);
        return [...users].sort((a, b) => a.name.localeCompare(b.name));
    },
    inviteUser: async (payload: { name: string; email: string; role: UserRole }): Promise<User> => {
        await sleep(600);
        const existingUser = users.find(user => user.email.toLowerCase() === payload.email.toLowerCase());
        if (existingUser) {
            toast.error('A user with this email already exists.');
            throw new Error('User already exists');
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            status: 'invited',
            createdAt: new Date().toISOString(),
            lastActive: undefined,
        };
        users.unshift(newUser);

        createAuditLog({
            action: 'User Invited',
            actor: 'Admin User',
            target: payload.email,
            status: 'success',
            ipAddress: '10.0.0.1',
        });

        toast.success('Invitation email sent to new user.');
        return newUser;
    },
    updateUserRole: async ({ userId, role }: { userId: string; role: UserRole }): Promise<User> => {
        await sleep(500);
        const index = users.findIndex(user => user.id === userId);
        if (index === -1) {
            toast.error('User not found.');
            throw new Error('User not found');
        }

        users[index] = { ...users[index], role, status: users[index].status ?? 'active' };

        createAuditLog({
            action: 'Role Updated',
            actor: 'Admin User',
            target: users[index].email,
            status: 'warning',
            metadata: { role },
        });

        toast.success('User role updated.');
        return users[index];
    },
    getSystemOverview: async (): Promise<SystemOverview> => {
        await sleep(500);
        return {
            uptime: 99.982,
            version: 'v2.5.1',
            lastDeploy: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            incidentsOpen: 1,
            nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
            environment: 'production',
            services: systemServices,
        } satisfies SystemOverview;
    },
    runHealthCheck: async (): Promise<HealthCheckResult> => {
        await sleep(700);
        const baseResults = [
            {
                name: 'Database',
                passed: true,
                message: 'Replication lag within normal parameters',
            },
            {
                name: 'Message Queue',
                passed: true,
                message: 'No backlog detected',
            },
            {
                name: 'Third-Party Payments',
                passed: systemServices.find(service => service.name === 'Payments')?.status !== 'offline',
                message: 'Latency slightly higher than baseline',
            },
            {
                name: 'Authentication Provider',
                passed: true,
                message: 'Token issuance stable',
            },
        ];

        const healthResult: HealthCheckResult = {
            checkedAt: new Date().toISOString(),
            results: baseResults,
            overallStatus: computeHealthStatus(baseResults),
        };

        createAuditLog({
            action: 'Health Check Executed',
            actor: 'Admin User',
            target: 'Platform',
            status: healthResult.overallStatus === 'healthy' ? 'success' : 'warning',
        });

        toast.success('Health check completed.');
        return healthResult;
    },
    getAuditLogs: async (): Promise<AuditLogEntry[]> => {
        await sleep(400);
        return [...auditLogs];
    },
    getCoinMetrics: async (): Promise<CoinMetric[]> => {
        await sleep(350);
        return coinMetrics.map(metric => ({ ...metric }));
    },
    getTreasurySnapshot: async (): Promise<TreasurySnapshot> => {
        await sleep(450);
        return {
            ...treasurySnapshot,
            assets: treasurySnapshot.assets.map(asset => ({ ...asset })),
            liabilities: treasurySnapshot.liabilities.map(liability => ({ ...liability })),
        };
    },
    getLiquidityPools: async (): Promise<LiquidityPool[]> => {
        await sleep(380);
        return liquidityPools.map(pool => ({ ...pool }));
    },
    getMarketMakers: async (): Promise<MarketMaker[]> => {
        await sleep(320);
        return marketMakers.map(maker => ({ ...maker }));
    },
    getNodeStatus: async (): Promise<NodeStatus[]> => {
        await sleep(360);
        return nodeStatuses.map(node => ({ ...node }));
    },
    getRiskAlerts: async (): Promise<RiskAlert[]> => {
        await sleep(300);
        return riskAlerts.map(alert => ({ ...alert }));
    },
    getComplianceTasks: async (): Promise<ComplianceTask[]> => {
        await sleep(320);
        return complianceTasks.map(task => ({ ...task }));
    },
    getWalletActivity: async (): Promise<WalletActivity[]> => {
        await sleep(420);
        return walletActivity.map(activity => ({ ...activity }));
    },
    getReleaseSchedule: async (): Promise<ReleaseEvent[]> => {
        await sleep(340);
        return releaseSchedule.map(event => ({ ...event }));
    },
    getGovernanceProposals: async (): Promise<GovernanceProposal[]> => {
        await sleep(360);
        return governanceProposals.map(proposal => ({ ...proposal }));
    },
};
