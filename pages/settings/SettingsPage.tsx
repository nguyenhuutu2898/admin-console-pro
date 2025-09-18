
import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { useSettingsStore } from '../../store/settingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Label } from '../../components/ui/Label';
import { Switch } from '../../components/ui/Switch';

const SettingsPage: React.FC = () => {
  const { isCompact, toggleCompact } = useSettingsStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences."
        className="max-w-2xl"
      />
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the application dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode" className="text-base font-medium">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable compact density for tables and lists to see more data at once.
              </p>
            </div>
            <Switch
              id="compact-mode"
              aria-label="Toggle compact mode"
              checked={isCompact}
              onCheckedChange={toggleCompact}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
