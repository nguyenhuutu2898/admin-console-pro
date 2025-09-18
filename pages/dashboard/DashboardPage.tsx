
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import PageHeader from '../../components/layout/PageHeader';
import { dashboardApi } from '../../services/api';
import { Users, ShoppingCart, Package } from '../../components/Icons'; // Assuming Package can represent revenue

const DashboardPage: React.FC = () => {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboardKpis'],
    queryFn: dashboardApi.getKpis
  });

  const kpiCards = [
    { title: 'Total Revenue', value: kpis?.totalRevenue, icon: Package, format: (v: number) => `$${v.toLocaleString()}` },
    { title: 'Total Orders', value: kpis?.totalOrders, icon: ShoppingCart, format: (v: number) => v.toLocaleString() },
    { title: 'Total Users', value: kpis?.totalUsers, icon: Users, format: (v: number) => v.toLocaleString() },
    { title: 'Uptime', value: kpis?.uptime, icon: Package, format: (v: number) => `${v}%` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
            Array.from({length: 4}).map((_, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-6 w-6" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3 mt-1" />
                    </CardContent>
                </Card>
            ))
        ) : (
            kpiCards.map((kpi) => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <kpi.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.format(kpi.value || 0)}</div>
                        <p className="text-xs text-muted-foreground">Updated just now</p>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
