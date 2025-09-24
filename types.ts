
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
  branch?: string;
  address?: string;
  updateTime?: string;
  updateHour?: string;
  password?: string;
  isActive?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  managerId?: string;
  managerName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Kiosk {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  deviceId: string;
  devicePassword: string;
  status: 'online' | 'offline' | 'maintenance';
  location: string;
  lastConnected?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video';
  contentUrl: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds for videos
  isActive: boolean;
  startDate: string;
  endDate: string;
  targetBranches: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
