
import { UserRole, type Order, type Product, type Customer, type User, type PaginatedResponse, type Branch, type Kiosk, type Advertisement, type TransactionType } from '../types';
import { toast } from 'sonner';

// --- DATA LOADING FROM PUBLIC JSON ---
let cachedProducts: Product[] | null = null;
let cachedOrders: Order[] | null = null;
let cachedCustomers: Customer[] | null = null;
const users: User[] = [
  { 
    id: '1', 
    name: 'John Smith', 
    email: 'admin@gmail.com', 
    role: UserRole.ADMIN, 
    avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    branch: 'Ho Chi Minh City Branch',
    address: '123 Main Street, District 1, Ho Chi Minh City',
    updateTime: '05/05/2022',
    updateHour: '17:20'
  },
  { 
    id: '2', 
    name: 'Jane Doe', 
    email: 'blahblah@gmail.com', 
    role: UserRole.STAFF, 
    avatarUrl: 'https://i.pravatar.cc/150?u=staff',
    branch: 'Ho Chi Minh City Branch',
    address: '123 Main Street, District 1, Ho Chi Minh City',
    updateTime: '26/05/2022',
    updateHour: '11:12'
  },
  { 
    id: '3', 
    name: 'Mike Johnson', 
    email: 'counter1@gmail.com', 
    role: UserRole.STAFF, 
    avatarUrl: 'https://i.pravatar.cc/150?u=viewer',
    branch: 'Ho Chi Minh City Branch',
    address: '123 Main Street, District 1, Ho Chi Minh City',
    updateTime: '18/05/2022',
    updateHour: '18:51'
  },
  { 
    id: '4', 
    name: 'Sarah Wilson', 
    email: 'counter1234@gmail.com', 
    role: UserRole.STAFF, 
    avatarUrl: 'https://i.pravatar.cc/150?u=viewer',
    updateTime: '27/04/2022',
    updateHour: '11:40'
  },
  { 
    id: '5', 
    name: 'David Brown', 
    email: 'counter4321@gmail.com', 
    role: UserRole.STAFF, 
    avatarUrl: 'https://i.pravatar.cc/150?u=viewer',
    updateTime: '27/04/2022',
    updateHour: '11:42'
  },
  { 
    id: '6', 
    name: 'Lisa Davis', 
    email: 'duytran@gmail.com', 
    role: UserRole.ADMIN, 
    avatarUrl: 'https://i.pravatar.cc/150?u=viewer',
    branch: 'Ho Chi Minh City Branch',
    address: '123 Main Street, District 1, Ho Chi Minh City',
    updateTime: '19/05/2022',
    updateHour: '14:00'
  },
];

// Mock data for new entities
const branches: Branch[] = [
  {
    id: '1',
    name: 'Ho Chi Minh City Branch',
    address: '123 Main Street, District 1, Ho Chi Minh City',
    phone: '+84 28 1234 5678',
    email: 'hcmc@company.com',
    managerId: '1',
    managerName: 'John Smith',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Hanoi Branch',
    address: '456 Ba Dinh Square, Hanoi',
    phone: '+84 24 8765 4321',
    email: 'hanoi@company.com',
    managerId: '6',
    managerName: 'Lisa Davis',
    isActive: true,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02'
  }
];

const kiosks: Kiosk[] = [
  {
    id: '1',
    name: 'Kiosk HCMC-001',
    branchId: '1',
    branchName: 'Ho Chi Minh City Branch',
    deviceId: 'DEV001',
    devicePassword: 'pass123',
    status: 'online',
    location: 'Lobby - Floor 1',
    lastConnected: '2024-01-15 10:30:00',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Kiosk HCMC-002',
    branchId: '1',
    branchName: 'Ho Chi Minh City Branch',
    deviceId: 'DEV002',
    devicePassword: 'pass456',
    status: 'offline',
    location: 'Lobby - Floor 2',
    isActive: true,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-10'
  }
];

const advertisements: Advertisement[] = [
  {
    id: '1',
    title: 'Welcome to Our Bank',
    description: 'Promotional video showcasing our services',
    type: 'video',
    contentUrl: '/ads/welcome-video.mp4',
    thumbnailUrl: '/ads/welcome-thumb.jpg',
    duration: 30,
    isActive: true,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    targetBranches: ['1', '2'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    title: 'New Loan Products',
    description: 'Image banner for new loan products',
    type: 'image',
    contentUrl: '/ads/loan-products.jpg',
    isActive: true,
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    targetBranches: ['1'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
];

const transactionTypes: TransactionType[] = [
  {
    id: '1',
    name: 'Cash Withdrawal',
    code: 'CASH_WITHDRAWAL',
    description: 'Cash withdrawal from ATM or counter',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Balance Inquiry',
    code: 'BALANCE_INQUIRY',
    description: 'Check account balance',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Transfer',
    code: 'TRANSFER',
    description: 'Transfer money between accounts',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
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

// --- Users Service ---
export const usersApi = {
  getUsers: async ({ page = 1, limit = 10, q = '', role = '' }: { page?: number; limit?: number; q?: string; role?: string; }): Promise<PaginatedResponse<User>> => {
    await sleep(600);
    let filteredUsers = [...users];

    if (q) {
      filteredUsers = filteredUsers.filter(u =>
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase())
      );
    }
    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }
    
    const total = filteredUsers.length;
    const data = filteredUsers.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  },
  
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    await sleep(500);
    const newUser: User = {
      id: `USER-${Date.now()}`,
      ...userData,
    };
    users.push(newUser);
    toast.success("User created successfully!");
    return newUser;
  },
  
  updateUser: async (userData: User): Promise<User> => {
    await sleep(500);
    const index = users.findIndex(u => u.id === userData.id);
    if (index !== -1) {
      users[index] = userData;
      toast.success("User updated successfully!");
      return users[index];
    }
    toast.error("User not found.");
    throw new Error('User not found');
  },
  
  deleteUser: async (userId: string): Promise<void> => {
    await sleep(500);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users.splice(index, 1);
      toast.success("User deleted successfully!");
    } else {
      toast.error("User not found.");
      throw new Error('User not found');
    }
  },
  
  assignPassword: async (userId: string): Promise<{ password: string }> => {
    await sleep(500);
    const user = users.find(u => u.id === userId);
    if (user) {
      const newPassword = Math.random().toString(36).substring(2, 10);
      user.password = newPassword;
      toast.success("Password assigned successfully!");
      return { password: newPassword };
    }
    toast.error("User not found.");
    throw new Error('User not found');
  },
  
  resetPassword: async (userId: string): Promise<{ password: string }> => {
    await sleep(500);
    const user = users.find(u => u.id === userId);
    if (user) {
      const newPassword = Math.random().toString(36).substring(2, 10);
      user.password = newPassword;
      toast.success("Password reset successfully!");
      return { password: newPassword };
    }
    toast.error("User not found.");
    throw new Error('User not found');
  },
};

// --- Branches Service ---
export const branchesApi = {
  getBranches: async ({ page = 1, limit = 10, q = '', status = '' }: { page?: number; limit?: number; q?: string; status?: string; }): Promise<PaginatedResponse<Branch>> => {
    await sleep(600);
    let filteredBranches = [...branches];

    if (q) {
      filteredBranches = filteredBranches.filter(b =>
        b.name.toLowerCase().includes(q.toLowerCase()) ||
        b.address.toLowerCase().includes(q.toLowerCase()) ||
        (b.managerName && b.managerName.toLowerCase().includes(q.toLowerCase()))
      );
    }
    if (status) {
      filteredBranches = filteredBranches.filter(b => {
        if (status === 'active') return b.isActive;
        if (status === 'inactive') return !b.isActive;
        return true;
      });
    }
    
    const total = filteredBranches.length;
    const data = filteredBranches.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  },
  
  createBranch: async (branchData: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Branch> => {
    await sleep(500);
    const newBranch: Branch = {
      id: `BRANCH-${Date.now()}`,
      ...branchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    branches.push(newBranch);
    toast.success("Branch created successfully!");
    return newBranch;
  },
  
  updateBranch: async (branchData: Branch): Promise<Branch> => {
    await sleep(500);
    const index = branches.findIndex(b => b.id === branchData.id);
    if (index !== -1) {
      branches[index] = { ...branchData, updatedAt: new Date().toISOString() };
      toast.success("Branch updated successfully!");
      return branches[index];
    }
    toast.error("Branch not found.");
    throw new Error('Branch not found');
  },
  
  deleteBranch: async (branchId: string): Promise<void> => {
    await sleep(500);
    const index = branches.findIndex(b => b.id === branchId);
    if (index !== -1) {
      branches.splice(index, 1);
      toast.success("Branch deleted successfully!");
    } else {
      toast.error("Branch not found.");
      throw new Error('Branch not found');
    }
  },
};

// --- Kiosks Service ---
export const kiosksApi = {
  getKiosks: async ({ page = 1, limit = 10, q = '', status = '', branchId = '' }: { page?: number; limit?: number; q?: string; status?: string; branchId?: string; }): Promise<PaginatedResponse<Kiosk>> => {
    await sleep(600);
    let filteredKiosks = [...kiosks];

    if (q) {
      filteredKiosks = filteredKiosks.filter(k =>
        k.name.toLowerCase().includes(q.toLowerCase()) ||
        k.branchName.toLowerCase().includes(q.toLowerCase()) ||
        k.deviceId.toLowerCase().includes(q.toLowerCase())
      );
    }
    if (status) {
      filteredKiosks = filteredKiosks.filter(k => k.status === status);
    }
    if (branchId) {
      filteredKiosks = filteredKiosks.filter(k => k.branchId === branchId);
    }
    
    const total = filteredKiosks.length;
    const data = filteredKiosks.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  },
  
  createKiosk: async (kioskData: Omit<Kiosk, 'id' | 'createdAt' | 'updatedAt'>): Promise<Kiosk> => {
    await sleep(500);
    const newKiosk: Kiosk = {
      id: `KIOSK-${Date.now()}`,
      ...kioskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    kiosks.push(newKiosk);
    toast.success("Kiosk created successfully!");
    return newKiosk;
  },
  
  updateKiosk: async (kioskData: Kiosk): Promise<Kiosk> => {
    await sleep(500);
    const index = kiosks.findIndex(k => k.id === kioskData.id);
    if (index !== -1) {
      kiosks[index] = { ...kioskData, updatedAt: new Date().toISOString() };
      toast.success("Kiosk updated successfully!");
      return kiosks[index];
    }
    toast.error("Kiosk not found.");
    throw new Error('Kiosk not found');
  },
  
  deleteKiosk: async (kioskId: string): Promise<void> => {
    await sleep(500);
    const index = kiosks.findIndex(k => k.id === kioskId);
    if (index !== -1) {
      kiosks.splice(index, 1);
      toast.success("Kiosk deleted successfully!");
    } else {
      toast.error("Kiosk not found.");
      throw new Error('Kiosk not found');
    }
  },
  
  connectKiosk: async (kioskId: string): Promise<{ deviceId: string; devicePassword: string }> => {
    await sleep(500);
    const kiosk = kiosks.find(k => k.id === kioskId);
    if (kiosk) {
      // Generate new credentials
      const newDeviceId = `DEV${Date.now()}`;
      const newPassword = Math.random().toString(36).substring(2, 10);
      
      kiosk.deviceId = newDeviceId;
      kiosk.devicePassword = newPassword;
      kiosk.status = 'online';
      kiosk.lastConnected = new Date().toISOString();
      kiosk.updatedAt = new Date().toISOString();
      
      toast.success("Kiosk connected successfully!");
      return { deviceId: newDeviceId, devicePassword: newPassword };
    }
    toast.error("Kiosk not found.");
    throw new Error('Kiosk not found');
  },
};

// --- Advertisements Service ---
export const advertisementsApi = {
  getAdvertisements: async ({ page = 1, limit = 10, q = '', type = '', status = '' }: { page?: number; limit?: number; q?: string; type?: string; status?: string; }): Promise<PaginatedResponse<Advertisement>> => {
    await sleep(600);
    let filteredAdvertisements = [...advertisements];

    if (q) {
      filteredAdvertisements = filteredAdvertisements.filter(a =>
        a.title.toLowerCase().includes(q.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(q.toLowerCase()))
      );
    }
    if (type) {
      filteredAdvertisements = filteredAdvertisements.filter(a => a.type === type);
    }
    if (status) {
      filteredAdvertisements = filteredAdvertisements.filter(a => {
        if (status === 'active') return a.isActive;
        if (status === 'inactive') return !a.isActive;
        return true;
      });
    }
    
    const total = filteredAdvertisements.length;
    const data = filteredAdvertisements.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  },
  
  createAdvertisement: async (advertisementData: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Advertisement> => {
    await sleep(500);
    const newAdvertisement: Advertisement = {
      id: `AD-${Date.now()}`,
      ...advertisementData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    advertisements.push(newAdvertisement);
    toast.success("Advertisement created successfully!");
    return newAdvertisement;
  },
  
  updateAdvertisement: async (advertisementData: Advertisement): Promise<Advertisement> => {
    await sleep(500);
    const index = advertisements.findIndex(a => a.id === advertisementData.id);
    if (index !== -1) {
      advertisements[index] = { ...advertisementData, updatedAt: new Date().toISOString() };
      toast.success("Advertisement updated successfully!");
      return advertisements[index];
    }
    toast.error("Advertisement not found.");
    throw new Error('Advertisement not found');
  },
  
  deleteAdvertisement: async (advertisementId: string): Promise<void> => {
    await sleep(500);
    const index = advertisements.findIndex(a => a.id === advertisementId);
    if (index !== -1) {
      advertisements.splice(index, 1);
      toast.success("Advertisement deleted successfully!");
    } else {
      toast.error("Advertisement not found.");
      throw new Error('Advertisement not found');
    }
  },
};

// --- Transaction Types Service ---
export const transactionTypesApi = {
  getTransactionTypes: async ({ page = 1, limit = 10, q = '', status = '' }: { page?: number; limit?: number; q?: string; status?: string; }): Promise<PaginatedResponse<TransactionType>> => {
    await sleep(600);
    let filteredTransactionTypes = [...transactionTypes];

    if (q) {
      filteredTransactionTypes = filteredTransactionTypes.filter(tt =>
        tt.name.toLowerCase().includes(q.toLowerCase()) ||
        tt.code.toLowerCase().includes(q.toLowerCase()) ||
        (tt.description && tt.description.toLowerCase().includes(q.toLowerCase()))
      );
    }
    if (status) {
      filteredTransactionTypes = filteredTransactionTypes.filter(tt => {
        if (status === 'active') return tt.isActive;
        if (status === 'inactive') return !tt.isActive;
        return true;
      });
    }
    
    const total = filteredTransactionTypes.length;
    const data = filteredTransactionTypes.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit };
  },
  
  createTransactionType: async (transactionTypeData: Omit<TransactionType, 'id' | 'createdAt' | 'updatedAt'>): Promise<TransactionType> => {
    await sleep(500);
    const newTransactionType: TransactionType = {
      id: `TT-${Date.now()}`,
      ...transactionTypeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    transactionTypes.push(newTransactionType);
    toast.success("Transaction type created successfully!");
    return newTransactionType;
  },
  
  updateTransactionType: async (transactionTypeData: TransactionType): Promise<TransactionType> => {
    await sleep(500);
    const index = transactionTypes.findIndex(tt => tt.id === transactionTypeData.id);
    if (index !== -1) {
      transactionTypes[index] = { ...transactionTypeData, updatedAt: new Date().toISOString() };
      toast.success("Transaction type updated successfully!");
      return transactionTypes[index];
    }
    toast.error("Transaction type not found.");
    throw new Error('Transaction type not found');
  },
  
  deleteTransactionType: async (transactionTypeId: string): Promise<void> => {
    await sleep(500);
    const index = transactionTypes.findIndex(tt => tt.id === transactionTypeId);
    if (index !== -1) {
      transactionTypes.splice(index, 1);
      toast.success("Transaction type deleted successfully!");
    } else {
      toast.error("Transaction type not found.");
      throw new Error('Transaction type not found');
    }
  },
};
