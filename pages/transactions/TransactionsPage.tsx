import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ArrowLeftRight } from '../../components/Icons';

const TransactionsPage: React.FC = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600">Track and manage system transactions</p>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12">
        <ArrowLeftRight className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature in development</h3>
        <p className="text-gray-500">Transactions page will be completed soon</p>
      </div>
    </div>
  );
};

export default TransactionsPage;
