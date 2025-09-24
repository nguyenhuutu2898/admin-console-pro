import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { UserCheck } from '../../components/Icons';

const PermissionsPage: React.FC = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">System Permissions</h1>
        <p className="text-gray-600">Manage user access rights and permissions</p>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12">
        <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature in development</h3>
        <p className="text-gray-500">Permissions page will be completed soon</p>
      </div>
    </div>
  );
};

export default PermissionsPage;
