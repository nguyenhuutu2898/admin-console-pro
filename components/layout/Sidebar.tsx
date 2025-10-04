
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, Users, LineChart, Settings, ChevronLeft, Shield, Search, UserCheck, ArrowLeftRight, Sparkles, Circle, Building, Monitor, Image, Play, Receipt, MoreVertical } from '../Icons';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { type NavItem, UserRole } from '../../types';
import { Button } from '../ui/Button';

const navItems: NavItem[] = [
  { title: 'Chi nhánh', href: '/branches', icon: Building, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STAFF] },
  { title: 'Phân quyền', href: '/users', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STAFF] },
  { title: 'Kiosk', href: '/kiosks', icon: Monitor, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STAFF] },
  { title: 'Quảng cáo', href: '/ads', icon: Image, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STAFF] },
  { title: 'Loại giao dịch', href: '/transaction-types', icon: Receipt, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STAFF] },
  { title: 'Thiết lập', href: '/settings', icon: Settings, roles: [UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STAFF] },
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
  
  // Filter menu items based on user role and permissions
  const getFilteredNavItems = () => {
    if (!user) return [];
    
    return navItems.filter(item => {
      // SUPER_ADMIN can see everything
      if (user.role === UserRole.SUPER_ADMIN) return true;
      
      // BRANCH_ADMIN can see most things except some admin-only features
      if (user.role === UserRole.BRANCH_ADMIN) {
        return true; // Can see all menu items but permissions are handled in each page
      }
      
      // STAFF can see all items but with limited permissions
      if (user.role === UserRole.STAFF) {
        return true; // Can see all menu items but permissions are handled in each page
      }
      
      return false;
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn('fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full flex-col bg-red-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-center border-b border-red-700 px-6">
          <NavLink to="/branches" className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-red-500 rounded-sm"></div>
            </div>
            {!isCollapsed && <span className="text-white font-bold">Admin Console Pro</span>}
          </NavLink>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {getFilteredNavItems().map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.title}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-white/80 transition-all hover:text-white hover:bg-red-700/50',
                  isActive && 'bg-gray-200 text-black',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span className="truncate font-medium">{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto hidden border-t border-red-700 p-4 lg:block">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="rounded-full w-full justify-start px-3 text-white hover:bg-red-700/50"
            >
                <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")}/>
                {!isCollapsed && <span className="ml-3">Thu gọn</span>}
            </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
