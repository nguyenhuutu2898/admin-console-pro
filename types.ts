// User roles
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_ADMIN = 'BRANCH_ADMIN',
  STAFF = 'STAFF'
}

// Branch
export type Branch = {
  id: string;
  code: string;          // Mã chi nhánh
  name: string;          // Tên chi nhánh
  province?: string;     // Tỉnh/Thành phố
  district?: string;     // Quận/Huyện
  ward?: string;         // Phường/Xã
  address?: string;
  phone?: string;
  email?: string;
  managerId?: string;
  managerName?: string;
  status?: 'active' | 'inactive';
  createdAt?: string; 
  updatedAt?: string;
};

// User
export type User = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  branchId?: string;      // Liên kết chi nhánh
  branchName?: string;
  permissions: string[];
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt?: string; 
  updatedAt?: string;
};

// Kiosk
export type Kiosk = {
  id: string;
  code: string;           // Mã kiosk
  name: string;
  branchId: string;
  branchName: string;
  deviceId: string;
  devicePassword?: string;
  connectionCode: string;
  status: 'connected' | 'disconnected' | 'inactive';
  location: string;
  lastSeenAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Advertisement (Quảng cáo)
export type Advertisement = {
  id: string;
  code: string;          // Mã quảng cáo
  name: string;          // Tên quảng cáo
  branchId?: string;     // Nếu ràng buộc chi nhánh
  type: 'image' | 'video' | 'html' | 'playlist';
  startDate?: string; 
  endDate?: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'ended';
  createdAt?: string;
  updatedAt?: string;
};

// TransactionType
export type TransactionType = {
  id: string;
  code: string;         // Mã giao dịch
  name: string;         // Tên giao dịch
  description?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
};

// Bộ lọc & phân trang chuẩn
export type Paging = { page?: number; limit?: number }; // 10/20/50/100
export type Search = { q?: string }; // ô search chung
export type LocationFilter = { province?: string; district?: string; ward?: string };
export type UserFilter = { branchId?: string; role?: string; status?: string };
export type KioskFilter = { branchId?: string; status?: string };
export type AdFilter = { branchId?: string; status?: string; type?: string; startDate?: string; endDate?: string };

export type PageResp<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Navigation
export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
};

// Legacy interfaces for backward compatibility
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Filter interfaces (legacy)
export interface BranchFilters {
  province?: string;
  district?: string;
  ward?: string;
  status?: string;
}

export interface UserFilters {
  branchId?: string;
  role?: UserRole;
  status?: string;
}

export interface KioskFilters {
  branchId?: string;
  status?: string;
}

export interface AdvertisementFilters {
  branchId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
}

// System Settings
export interface SystemSettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordExpiryDays: number;
  kioskConnectionTimeout: number;
  advertisementRotationInterval: number;
  systemMaintenanceMode: boolean;
  autoBackupEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// Form data interfaces
export interface CreateBranchData {
  name: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  phone?: string;
  email?: string;
  managerId?: string;
  managerName?: string;
}

export interface CreateUserData {
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  branchId?: string;
  password: string;
}

export interface CreateKioskData {
  name: string;
  branchId: string;
  location: string;
}

export interface CreateAdvertisementData {
  title: string;
  description?: string;
  type: 'image' | 'video' | 'banner';
  duration: number;
  startDate: string;
  endDate: string;
  targetBranchIds: string[];
  isActive: boolean;
}