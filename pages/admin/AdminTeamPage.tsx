import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { InviteUserDialog, type InviteUserSchema } from '../../components/admin/InviteUserDialog';
import { UserRoleSelect } from '../../components/admin/UserRoleSelect';
import { adminApi } from '../../services/api';
import type { User, UserRole } from '../../types';

const statusBadgeVariant: Record<NonNullable<User['status']>, 'secondary' | 'default' | 'destructive'> = {
  active: 'secondary',
  invited: 'default',
  suspended: 'destructive',
};

const relativeTime = (isoDate?: string) => {
  if (!isoDate) {
    return '—';
  }
  const now = Date.now();
  const diff = now - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const AdminTeamPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const {
    data: users,
    isLoading: usersLoading,
    isFetching: usersRefreshing,
  } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers(),
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteUserSchema) => adminApi.inviteUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setInviteOpen(false);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => adminApi.updateUserRole({ userId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm.trim()) return users;
    const normalized = searchTerm.trim().toLowerCase();
    return users.filter(user =>
      [user.name, user.email].some(value => value.toLowerCase().includes(normalized))
    );
  }, [users, searchTerm]);

  const teamStats = useMemo(() => {
    if (!users) {
      return { total: 0, active: 0, invited: 0 };
    }
    const invited = users.filter(user => user.status === 'invited').length;
    const active = users.length - invited;
    return { total: users.length, active, invited };
  }, [users]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Team management</CardTitle>
          <CardDescription>Invite teammates, adjust permissions and monitor recent activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total members</p>
              <p className="mt-1 text-2xl font-semibold">{teamStats.total}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="mt-1 text-2xl font-semibold">{teamStats.active}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Invited</p>
              <p className="mt-1 text-2xl font-semibold">{teamStats.invited}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Members</CardTitle>
            <CardDescription>Filter and manage access for everyone in the console.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:max-w-xs">
              <Input
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search by name or email"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="ghost"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })}
                disabled={usersRefreshing || usersLoading}
              >
                Refresh
              </Button>
              <Button onClick={() => setInviteOpen(true)}>Invite user</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`member-skeleton-${index}`} className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-md border p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{user.name}</p>
                      {user.status && (
                        <Badge variant={statusBadgeVariant[user.status] || 'secondary'} className="uppercase">
                          {user.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Last active {relativeTime(user.lastActive)}</p>
                  </div>
                  <UserRoleSelect
                    value={user.role}
                    disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.userId === user.id}
                    onChange={role => updateRoleMutation.mutate({ userId: user.id, role })}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed p-10 text-center">
              <p className="text-sm font-medium">No members match your search.</p>
              <p className="text-sm text-muted-foreground">
                Try a different name or email, or invite someone new to join the console.
              </p>
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                Invite user
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={values => inviteMutation.mutate(values)}
        isSubmitting={inviteMutation.isPending}
      />
    </div>
  );
};

export default AdminTeamPage;
