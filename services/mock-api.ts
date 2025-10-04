// Mock API service for development and testing
import { Branch, User, Kiosk, Advertisement, TransactionType, UserRole } from '../types';

// Mock data
const mockBranches: Branch[] = [
  {
    id: '1',
    code: 'HN001',
    coreCode: 'HN001_CORE',
    name: 'Chi nhánh Hà Nội',
    province: 'Hà Nội',
    district: 'Quận Ba Đình',
    ward: 'Phường Phúc Xá',
    address: '123 Đường Láng, Phúc Xá, Ba Đình, Hà Nội',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    code: 'HCM001',
    coreCode: 'HCM001_CORE',
    name: 'Chi nhánh TP.HCM',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    address: '456 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    fullName: 'Nguyễn Văn Admin',
    email: 'admin@example.com',
    branchId: '1',
    branchName: 'Chi nhánh Hà Nội',
    role: UserRole.SUPER_ADMIN,
    permissions: ['all'],
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'branch_admin',
    fullName: 'Trần Thị Branch Admin',
    email: 'branch_admin@example.com',
    branchId: '1',
    branchName: 'Chi nhánh Hà Nội',
    role: UserRole.BRANCH_ADMIN,
    permissions: ['branch_manage'],
    status: 'active',
    lastLogin: '2024-01-14T15:20:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const mockKiosks: Kiosk[] = [
  {
    id: '1',
    code: 'K001',
    name: 'Kiosk Hà Nội 1',
    branchId: '1',
    branchName: 'Chi nhánh Hà Nội',
    deviceId: 'DEV001',
    devicePassword: 'pass123',
    connectionCode: 'CONN123456',
    status: 'connected',
    location: 'Lobby - Floor 1',
    lastSeenAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    code: 'K002',
    name: 'Kiosk TP.HCM 1',
    branchId: '2',
    branchName: 'Chi nhánh TP.HCM',
    deviceId: 'DEV002',
    devicePassword: 'pass456',
    connectionCode: 'CONN789012',
    status: 'disconnected',
    location: 'Lobby - Floor 2',
    lastSeenAt: '2024-01-14T15:45:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
  },
];

const mockAds: Advertisement[] = [
  {
    id: '1',
    code: 'AD001',
    name: 'Quảng cáo sản phẩm mới',
    branchId: '1',
    type: 'image',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    status: 'running',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    code: 'AD002',
    name: 'Video giới thiệu dịch vụ',
    branchId: '2',
    type: 'video',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-02-28T23:59:59Z',
    status: 'scheduled',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
];

const mockTransactionTypes: TransactionType[] = [
  {
    id: '1',
    code: 'TXN001',
    name: 'Giao dịch mua hàng',
    description: 'Giao dịch mua sản phẩm/dịch vụ',
    status: 'active',
  },
  {
    id: '2',
    code: 'TXN002',
    name: 'Giao dịch hoàn tiền',
    description: 'Giao dịch hoàn tiền cho khách hàng',
    status: 'active',
  },
];

// Mock API functions
export const mockApi = {
  // Auth
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user by email
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      // In real app, you would verify password hash here
      return {
        user,
        token: `mock-jwt-token-${user.id}`,
      };
    }
    
    throw new Error('Invalid credentials');
  },

  // Branches
  getBranches: async (params: any = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    let filteredBranches = [...mockBranches];
    
    // Apply search filter
    if (params.q) {
      const searchTerm = params.q.toLowerCase();
      filteredBranches = filteredBranches.filter(branch => 
        branch.code.toLowerCase().includes(searchTerm) ||
        branch.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply other filters
    if (params.province) {
      filteredBranches = filteredBranches.filter(branch => branch.province === params.province);
    }
    if (params.district) {
      filteredBranches = filteredBranches.filter(branch => branch.district === params.district);
    }
    if (params.ward) {
      filteredBranches = filteredBranches.filter(branch => branch.ward === params.ward);
    }
    
    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      items: filteredBranches.slice(startIndex, endIndex),
      total: filteredBranches.length,
      page,
      limit,
    };
  },

  createBranch: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newBranch: Branch = {
      id: Date.now().toString(),
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBranches.push(newBranch);
    return newBranch;
  },

  updateBranch: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockBranches.findIndex(branch => branch.id === id);
    if (index !== -1) {
      mockBranches[index] = { ...mockBranches[index], ...data, updatedAt: new Date().toISOString() };
      return mockBranches[index];
    }
    throw new Error('Branch not found');
  },

  deleteBranch: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockBranches.findIndex(branch => branch.id === id);
    if (index !== -1) {
      mockBranches.splice(index, 1);
    }
  },

  // Users
  getUsers: async (params: any = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredUsers = [...mockUsers];
    
    if (params.q) {
      const searchTerm = params.q.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.fullName.toLowerCase().includes(searchTerm)
      );
    }
    
    if (params.branchId) {
      filteredUsers = filteredUsers.filter(user => user.branchId === params.branchId);
    }
    if (params.role) {
      filteredUsers = filteredUsers.filter(user => user.role === params.role);
    }
    if (params.status) {
      filteredUsers = filteredUsers.filter(user => user.status === params.status);
    }
    
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      items: filteredUsers.slice(startIndex, endIndex),
      total: filteredUsers.length,
      page,
      limit,
    };
  },

  createUser: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      id: Date.now().toString(),
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  },

  updateUser: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockUsers.findIndex(user => user.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...data, updatedAt: new Date().toISOString() };
      return mockUsers[index];
    }
    throw new Error('User not found');
  },

  deleteUser: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockUsers.findIndex(user => user.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
    }
  },

  resetPassword: async (id: string, newPassword: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real implementation, this would update the password
    console.log(`Password reset for user ${id}: ${newPassword}`);
  },

  // Kiosks
  getKiosks: async (params: any = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredKiosks = [...mockKiosks];
    
    if (params.q) {
      const searchTerm = params.q.toLowerCase();
      filteredKiosks = filteredKiosks.filter(kiosk => 
        kiosk.code.toLowerCase().includes(searchTerm) ||
        kiosk.name.toLowerCase().includes(searchTerm)
      );
    }
    
    if (params.branchId) {
      filteredKiosks = filteredKiosks.filter(kiosk => kiosk.branchId === params.branchId);
    }
    if (params.status) {
      filteredKiosks = filteredKiosks.filter(kiosk => kiosk.status === params.status);
    }
    
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      items: filteredKiosks.slice(startIndex, endIndex),
      total: filteredKiosks.length,
      page,
      limit,
    };
  },

  createKiosk: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newKiosk: Kiosk = {
      id: Date.now().toString(),
      ...data,
      status: 'disconnected',
    };
    mockKiosks.push(newKiosk);
    return newKiosk;
  },

  updateKiosk: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockKiosks.findIndex(kiosk => kiosk.id === id);
    if (index !== -1) {
      mockKiosks[index] = { ...mockKiosks[index], ...data };
      return mockKiosks[index];
    }
    throw new Error('Kiosk not found');
  },

  deleteKiosk: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockKiosks.findIndex(kiosk => kiosk.id === id);
    if (index !== -1) {
      mockKiosks.splice(index, 1);
    }
  },

  generateConnectCode: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      code,
      expiresIn: 300, // 5 minutes
    };
  },

  // Ads
  getAds: async (params: any = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredAds = [...mockAds];
    
    if (params.q) {
      const searchTerm = params.q.toLowerCase();
      filteredAds = filteredAds.filter(ad => 
        ad.code.toLowerCase().includes(searchTerm) ||
        ad.name.toLowerCase().includes(searchTerm)
      );
    }
    
    if (params.branchId) {
      filteredAds = filteredAds.filter(ad => ad.branchId === params.branchId);
    }
    if (params.status) {
      filteredAds = filteredAds.filter(ad => ad.status === params.status);
    }
    if (params.type) {
      filteredAds = filteredAds.filter(ad => ad.type === params.type);
    }
    
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      items: filteredAds.slice(startIndex, endIndex),
      total: filteredAds.length,
      page,
      limit,
    };
  },

  createAd: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newAd: Advertisement = {
      id: Date.now().toString(),
      code: `AD${String(mockAds.length + 1).padStart(3, '0')}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAds.push(newAd);
    return newAd;
  },

  updateAd: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAds.findIndex(ad => ad.id === id);
    if (index !== -1) {
      mockAds[index] = { 
        ...mockAds[index], 
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockAds[index];
    }
    throw new Error('Advertisement not found');
  },

  deleteAd: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAds.findIndex(ad => ad.id === id);
    if (index !== -1) {
      mockAds.splice(index, 1);
    }
  },

  // Transaction Types
  getTransactionTypes: async (params: any = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredTypes = [...mockTransactionTypes];
    
    if (params.q) {
      const searchTerm = params.q.toLowerCase();
      filteredTypes = filteredTypes.filter(type => 
        type.code.toLowerCase().includes(searchTerm) ||
        type.name.toLowerCase().includes(searchTerm)
      );
    }
    
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      items: filteredTypes.slice(startIndex, endIndex),
      total: filteredTypes.length,
      page,
      limit,
    };
  },

  updateTransactionType: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTransactionTypes.findIndex(type => type.id === id);
    if (index !== -1) {
      mockTransactionTypes[index] = { ...mockTransactionTypes[index], ...data };
      return mockTransactionTypes[index];
    }
    throw new Error('Transaction type not found');
  },

  // Settings
  getSettings: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiryDays: 90,
      kioskConnectionTimeout: 30,
      advertisementRotationInterval: 10,
      systemMaintenanceMode: false,
      autoBackupEnabled: true,
      emailNotifications: true,
      smsNotifications: false,
    };
  },

  updateSettings: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real implementation, this would save to backend
    console.log('Settings updated:', data);
  },
};
