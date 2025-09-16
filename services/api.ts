
import { UserRole, type Order, type Product, type Customer, type User, type PaginatedResponse } from '../types';
import { toast } from 'sonner';

// --- MOCK DATABASE ---
const users: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@gmail.com', role: UserRole.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=admin' },
    { id: '2', name: 'Staff User', email: 'staff@gmail.com', role: UserRole.STAFF, avatarUrl: 'https://i.pravatar.cc/150?u=staff' },
    { id: '3', name: 'Viewer User', email: 'viewer@gmail.com', role: UserRole.VIEWER, avatarUrl: 'https://i.pravatar.cc/150?u=viewer' },
]

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
