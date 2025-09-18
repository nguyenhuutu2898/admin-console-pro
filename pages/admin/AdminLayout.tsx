import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';

import PageHeader from '../../components/layout/PageHeader';
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
      <PageHeader
        title="Admin Console"
        description="Control centre for teams, infrastructure and security."
        actions={
          <>
            {isFetching ? <Badge variant="secondary">Syncing data…</Badge> : null}
            {user ? <Badge variant="secondary">{user.role}</Badge> : null}
          </>
        }
        titleSectionClassName="space-y-2"
      />

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
