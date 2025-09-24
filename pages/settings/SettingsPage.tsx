
import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Label } from '../../components/ui/Label';
import { Switch } from '../../components/ui/Switch';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const SettingsPage: React.FC = () => {
  const { isCompact, toggleCompact } = useSettingsStore();
  const [systemSettings, setSystemSettings] = useState({
    sessionTimeout: '30',
    maxLoginAttempts: '3',
    passwordExpiryDays: '90',
    kioskConnectionTimeout: '30',
    advertisementRotationInterval: '10',
    systemMaintenanceMode: false,
    autoBackupEnabled: true,
    emailNotifications: true,
    smsNotifications: false
  });

  return (
    <div className="p-6">
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
              Manage your account and application preferences.
          </p>
        </div>
      
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

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>
            Configure system parameters and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={systemSettings.sessionTimeout}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
              <Input
                id="max-login-attempts"
                type="number"
                value={systemSettings.maxLoginAttempts}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-expiry">Password Expiry (days)</Label>
              <Input
                id="password-expiry"
                type="number"
                value={systemSettings.passwordExpiryDays}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, passwordExpiryDays: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kiosk-timeout">Kiosk Connection Timeout (seconds)</Label>
              <Input
                id="kiosk-timeout"
                type="number"
                value={systemSettings.kioskConnectionTimeout}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, kioskConnectionTimeout: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ad-rotation">Advertisement Rotation Interval (seconds)</Label>
              <Input
                id="ad-rotation"
                type="number"
                value={systemSettings.advertisementRotationInterval}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, advertisementRotationInterval: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode" className="text-base font-medium">System Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable maintenance mode to temporarily disable system features.
                </p>
              </div>
              <Switch
                id="maintenance-mode"
                checked={systemSettings.systemMaintenanceMode}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, systemMaintenanceMode: checked }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="auto-backup" className="text-base font-medium">Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic daily backup of system data.
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={systemSettings.autoBackupEnabled}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackupEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable email notifications for system events.
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={systemSettings.emailNotifications}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications" className="text-base font-medium">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable SMS notifications for critical system events.
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={systemSettings.smsNotifications}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, smsNotifications: checked }))}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => console.log('Save settings:', systemSettings)}>
              Save Settings
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
