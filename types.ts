
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
