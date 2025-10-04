import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Switch } from '../../components/ui/Switch';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { settingsApi } from '../../services/settings';
import { useAuth } from '../../hooks/useAuth';

const SettingsPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Fetch settings
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setIsEditing(false);
    },
  });

  // Initialize settings when data is loaded
  React.useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    updateMutation.mutate(settings);
  };

  const handleResetSettings = () => {
    if (settingsData) {
      setSettings(settingsData);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-gray-500 mb-4">Không thể tải cài đặt hệ thống</p>
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <LoadingSkeleton rows={3} columns={1} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thiết lập</h1>
        <p className="text-gray-600">
          {isSuperAdmin() 
            ? "Cấu hình các thông số hệ thống" 
            : "Xem thông tin cài đặt hệ thống"
          }
        </p>
      </div>

      <div className="space-y-6">
        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Thiết lập hệ thống</CardTitle>
            <CardDescription>
              Cấu hình các thông số cơ bản của hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="sessionTimeout">Thời gian hết phiên (phút)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout || ''}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  disabled={!isSuperAdmin()}
                  placeholder="30"
                />
              </div>
              
              <div>
                <Label htmlFor="maxLoginAttempts">Số lần đăng nhập tối đa</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts || ''}
                  onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  disabled={!isSuperAdmin()}
                  placeholder="5"
                />
              </div>
              
              <div>
                <Label htmlFor="passwordExpiryDays">Thời hạn mật khẩu (ngày)</Label>
                <Input
                  id="passwordExpiryDays"
                  type="number"
                  value={settings.passwordExpiryDays || ''}
                  onChange={(e) => handleSettingChange('passwordExpiryDays', parseInt(e.target.value))}
                  disabled={!isSuperAdmin()}
                  placeholder="90"
                />
              </div>
              
              <div>
                <Label htmlFor="kioskConnectionTimeout">Timeout kết nối Kiosk (giây)</Label>
                <Input
                  id="kioskConnectionTimeout"
                  type="number"
                  value={settings.kioskConnectionTimeout || ''}
                  onChange={(e) => handleSettingChange('kioskConnectionTimeout', parseInt(e.target.value))}
                  disabled={!isSuperAdmin()}
                  placeholder="30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advertisement Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt quảng cáo</CardTitle>
            <CardDescription>
              Cấu hình các thông số liên quan đến quảng cáo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="advertisementRotationInterval">Thời gian xoay quảng cáo (giây)</Label>
                <Input
                  id="advertisementRotationInterval"
                  type="number"
                  value={settings.advertisementRotationInterval || ''}
                  onChange={(e) => handleSettingChange('advertisementRotationInterval', parseInt(e.target.value))}
                  disabled={!isSuperAdmin()}
                  placeholder="10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái hệ thống</CardTitle>
            <CardDescription>
              Quản lý trạng thái hoạt động của hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemMaintenanceMode">Chế độ bảo trì</Label>
                  <p className="text-sm text-gray-500">Kích hoạt chế độ bảo trì hệ thống</p>
                </div>
                <Switch
                  id="systemMaintenanceMode"
                  checked={settings.systemMaintenanceMode || false}
                  onCheckedChange={(checked) => handleSettingChange('systemMaintenanceMode', checked)}
                  disabled={!isSuperAdmin()}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackupEnabled">Tự động sao lưu</Label>
                  <p className="text-sm text-gray-500">Tự động sao lưu dữ liệu hàng ngày</p>
                </div>
                <Switch
                  id="autoBackupEnabled"
                  checked={settings.autoBackupEnabled || false}
                  onCheckedChange={(checked) => handleSettingChange('autoBackupEnabled', checked)}
                  disabled={!isSuperAdmin()}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt thông báo</CardTitle>
            <CardDescription>
              Cấu hình các kênh thông báo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Thông báo Email</Label>
                  <p className="text-sm text-gray-500">Gửi thông báo qua email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications || false}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  disabled={!isSuperAdmin()}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">Thông báo SMS</Label>
                  <p className="text-sm text-gray-500">Gửi thông báo qua SMS</p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications || false}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  disabled={!isSuperAdmin()}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isSuperAdmin() && (
          <div className="flex gap-4 pt-6">
            <Button 
              onClick={handleSaveSettings}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleResetSettings}
              disabled={updateMutation.isPending}
            >
              Đặt lại
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;