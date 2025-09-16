
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, Users, LineChart, Settings, ChevronLeft, Shield } from '../Icons';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { type NavItem, UserRole } from '../../types';
import { Button } from '../ui/Button';

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home, roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.VIEWER] },
  { title: 'Orders', href: '/orders', icon: ShoppingCart, roles: [UserRole.ADMIN, UserRole.STAFF] },
  { title: 'Products', href: '/products', icon: Package, roles: [UserRole.ADMIN, UserRole.STAFF] },
  { title: 'Customers', href: '/customers', icon: Users, roles: [UserRole.ADMIN, UserRole.STAFF] },
  { title: 'Analytics', href: '/analytics', icon: LineChart, roles: [UserRole.ADMIN] },
  { title: 'Admin', href: '/admin', icon: Shield, roles: [UserRole.ADMIN] },
  { title: 'Settings', href: '/settings', icon: Settings, roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.VIEWER] },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userHasRole = (roles: UserRole[]) => user && roles.includes(user.role);

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn('fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            {!isCollapsed && <span className="">Admin Pro</span>}
          </NavLink>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {navItems.filter(item => userHasRole(item.roles)).map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <NavLink
                key={item.title}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-muted text-primary',
                  isCollapsed && 'justify-center'
                )}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto hidden border-t p-4 lg:block">
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="rounded-full w-full justify-start px-3">
                <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")}/>
                {!isCollapsed && <span className="ml-3">Collapse</span>}
            </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
