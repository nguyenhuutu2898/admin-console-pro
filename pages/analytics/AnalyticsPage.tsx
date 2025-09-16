
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

// Since recharts is loaded via a UMD script tag, declare it to satisfy TypeScript
declare const Recharts: any;

const AnalyticsPage: React.FC = () => {
  // Check if the Recharts library is available on the window object before using it
  const isRechartsAvailable = typeof Recharts !== 'undefined';
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = isRechartsAvailable ? Recharts : {} as any;

  const sampleData = [
    { name: 'Jan', revenue: 4000, orders: 2400 },
    { name: 'Feb', revenue: 3000, orders: 1398 },
    { name: 'Mar', revenue: 5200, orders: 9800 },
    { name: 'Apr', revenue: 2780, orders: 3908 },
    { name: 'May', revenue: 1890, orders: 4800 },
    { name: 'Jun', revenue: 2390, orders: 3800 },
    { name: 'Jul', revenue: 3490, orders: 4300 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 350 }}>
             {isRechartsAvailable ? (
                <ResponsiveContainer>
                    <BarChart data={sampleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                          contentStyle={{
                              background: "hsl(var(--background))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                          }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="orders" fill="hsl(var(--secondary-foreground))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                  <p className="text-muted-foreground">Analytics library (Recharts) failed to load.</p>
                </div>
             )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Additional Analytics</CardTitle>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center bg-muted/50 rounded-md">
            <p className="text-muted-foreground">Another chart or data visualization can go here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
