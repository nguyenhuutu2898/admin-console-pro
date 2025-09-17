
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
} from '../types';
import { toast } from 'sonner';

// --- MOCK DATABASE ---
const users: User[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@gmail.com',
        role: UserRole.ADMIN,
        avatarUrl: 'https://i.pravatar.cc/150?u=admin',
        status: 'active',
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    },
    {
        id: '2',
        name: 'Staff User',
        email: 'staff@gmail.com',
        role: UserRole.STAFF,
        avatarUrl: 'https://i.pravatar.cc/150?u=staff',
        status: 'active',
        lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    },
    {
        id: '3',
        name: 'Viewer User',
        email: 'viewer@gmail.com',
        role: UserRole.VIEWER,
        avatarUrl: 'https://i.pravatar.cc/150?u=viewer',
        status: 'active',
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
];

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

const products: Product[] = Array.from({ length: 55 }, (_, i) => ({
    id: `PROD-${1001 + i}`,
    name: `Laptop Model ${i % 10 === 0 ? 'XPS' : 'Inspiron'} ${13 + i}`,
    price: 999.99 + i * 50,
    stock: 10 + i * 2,
    category: i % 3 === 0 ? 'Gaming' : 'Business',
}));

const orders: Order[] = Array.from({ length: 120 }, (_, i) => {
    const statusOptions: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
        id: `ORD-${2024001 + i}`,
        customerName: `Customer ${i + 1}`,
        customerEmail: `customer${i + 1}@example.com`,
        total: Math.round((Math.random() * 500 + 50) * 100) / 100,
        status: statusOptions[i % statusOptions.length],
        date: date.toISOString().split('T')[0],
    };
});

const customers: Customer[] = Array.from({ length: 80 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i * 5);
    return {
        id: `CUST-${3001 + i}`,
        name: `Customer Name ${i + 1}`,
        email: `customer_name_${i + 1}@email.com`,
        phone: `555-010${i % 100}`,
        totalSpent: Math.round((Math.random() * 2000 + 100) * 100) / 100,
        joinDate: date.toISOString().split('T')[0],
    };
});

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
        return {
            totalUsers: users.length,
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
            uptime: 99.98,
        };
    }
}

// --- Orders Service ---
export const ordersApi = {
  getOrders: async ({ page = 1, limit = 10, q = '', status = '' }): Promise<PaginatedResponse<Order>> => {
    await sleep(600);
    let filteredOrders = orders;

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

    const total = filteredOrders.length;
    const data = filteredOrders.slice((page - 1) * limit, page * limit);

    return { data, total, page, limit };
  },
};

// --- Products Service ---
export const productsApi = {
  getProducts: async ({ page = 1, limit = 10, q = '' }): Promise<PaginatedResponse<Product>> => {
    await sleep(600);
    let filteredProducts = products;

    if (q) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    }
    
    const total = filteredProducts.length;
    const data = filteredProducts.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  },
  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    await sleep(500);
    const newProduct: Product = {
      id: `PROD-${Date.now()}`,
      ...productData,
    };
    products.unshift(newProduct);
    toast.success("Product created successfully!");
    return newProduct;
  },
  updateProduct: async (productData: Product): Promise<Product> => {
    await sleep(500);
    const index = products.findIndex(p => p.id === productData.id);
    if (index !== -1) {
      products[index] = productData;
      toast.success("Product updated successfully!");
      return products[index];
    }
    toast.error("Product not found.");
    throw new Error('Product not found');
  },
};

// --- Customers Service ---
export const customersApi = {
  getCustomers: async ({ page = 1, limit = 10, q = '' }): Promise<PaginatedResponse<Customer>> => {
    await sleep(700);
    let filteredCustomers = customers;

    if (q) {
      filteredCustomers = filteredCustomers.filter(c =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.email.toLowerCase().includes(q.toLowerCase())
      );
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
};
