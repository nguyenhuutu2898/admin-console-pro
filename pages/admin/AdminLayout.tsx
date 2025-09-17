import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';

import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const tabs = [
  { label: 'Overview', href: '/admin', end: true },
  { label: 'Team', href: '/admin/team' },
  { label: 'Diagnostics', href: '/admin/diagnostics' },
  { label: 'Audit log', href: '/admin/audit' },
];

const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();
  const isFetching = useIsFetching({ queryKey: ['admin'] }) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">
            Control centre for teams, infrastructure and security.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isFetching && <Badge variant="secondary">Syncing data…</Badge>}
          {user && <Badge variant="secondary">{user.role}</Badge>}
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <NavLink
            key={tab.href}
            to={tab.href}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
