
import { UserRole, type Order, type Product, type Customer, type User, type PaginatedResponse } from '../types';
import { toast } from 'sonner';

// --- DATA LOADING FROM PUBLIC JSON ---
let cachedProducts: Product[] | null = null;
let cachedOrders: Order[] | null = null;
let cachedCustomers: Customer[] | null = null;
const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@gmail.com', role: UserRole.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=admin' },
  { id: '2', name: 'Staff User', email: 'staff@gmail.com', role: UserRole.STAFF, avatarUrl: 'https://i.pravatar.cc/150?u=staff' },
  { id: '3', name: 'Viewer User', email: 'viewer@gmail.com', role: UserRole.VIEWER, avatarUrl: 'https://i.pravatar.cc/150?u=viewer' },
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
