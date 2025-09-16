import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const AdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground">Administrative tools and system controls</p>
        </div>
        <Badge variant="secondary">ADMIN</Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Manage roles and access</p>
            <div className="flex gap-2">
              <Button size="sm">Invite User</Button>
              <Button size="sm" variant="secondary">View All</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Configuration and maintenance</p>
            <div className="flex gap-2">
              <Button size="sm">Run Health Check</Button>
              <Button size="sm" variant="secondary">View Logs</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Audit and compliance</p>
            <div className="flex gap-2">
              <Button size="sm">Audit Trail</Button>
              <Button size="sm" variant="secondary">Access Policies</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;


