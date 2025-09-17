
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
