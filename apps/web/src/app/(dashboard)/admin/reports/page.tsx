'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportDialog } from '@/components/reports/export-dialog';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, Zap, DollarSign } from 'lucide-react';

// Mock data for Recharts (In a real app, fetch this via TanStack Query)
const revenueData = [
  { month: 'Jan', revenue: 4000, predicted: 4200 },
  { month: 'Feb', revenue: 3000, predicted: 3100 },
  { month: 'Mar', revenue: 5000, predicted: 5100 },
  { month: 'Apr', revenue: 4500, predicted: 4600 },
  { month: 'May', revenue: 6000, predicted: 6200 },
  { month: 'Jun', revenue: 7000, predicted: 7500 },
];

const lossData = [
  { month: 'Jan', technicalLoss: 400, theftLoss: 240 },
  { month: 'Feb', technicalLoss: 300, theftLoss: 139 },
  { month: 'Mar', technicalLoss: 200, theftLoss: 980 },
  { month: 'Apr', technicalLoss: 278, theftLoss: 390 },
  { month: 'May', technicalLoss: 189, theftLoss: 480 },
  { month: 'Jun', technicalLoss: 239, theftLoss: 380 },
];

const revenueColumns: ColumnDef<any>[] = [
  { accessorKey: 'month', header: 'Month' },
  { accessorKey: 'revenue', header: 'Actual Revenue ($)' },
  { accessorKey: 'predicted', header: 'Predicted Revenue ($)' },
];

const lossColumns: ColumnDef<any>[] = [
  { accessorKey: 'month', header: 'Month' },
  { accessorKey: 'technicalLoss', header: 'Technical Loss (kWh)' },
  { accessorKey: 'theftLoss', header: 'Theft Loss (kWh)' },
];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Intelligence & Reports</h1>
          <p className="text-muted-foreground mt-1">Generate, analyze, and schedule enterprise reports.</p>
        </div>
        <ExportDialog reportType={activeTab as any} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$29,500.00</div>
            <p className="text-xs text-muted-foreground">+20.1% from last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Distributed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234 kWh</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Loss</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">2,609 kWh</div>
            <p className="text-xs text-muted-foreground">Technical + Non-Technical</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO2 Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+573 kg</div>
            <p className="text-xs text-muted-foreground">Due to AI recommendations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="loss">Loss & Theft</TabsTrigger>
          <TabsTrigger value="energy">Energy Metrics</TabsTrigger>
          <TabsTrigger value="co2">CO2 Impact</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Predicted</CardTitle>
              <CardDescription>Actual revenue collection vs AI predicted bill estimates.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="predicted" stroke="#6366f1" fillOpacity={1} fill="url(#colorPred)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Raw Data Table</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={revenueColumns} data={revenueData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loss" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Loss Distribution</CardTitle>
              <CardDescription>Technical grid loss vs non-technical loss (Theft).</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={lossData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="technicalLoss" stackId="a" fill="#f59e0b" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="theftLoss" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Raw Data Table</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={lossColumns} data={lossData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Similar patterns for Energy and CO2 tabs */}
        <TabsContent value="energy">
          <Card>
             <CardHeader>
              <CardTitle>Energy Metrics</CardTitle>
              <CardDescription>Grid-level load analytics. Choose Export to get full CSV/PDF.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="co2">
          <Card>
             <CardHeader>
              <CardTitle>CO2 Impact Report</CardTitle>
              <CardDescription>Estimated metric tons of CO2 saved via AI Recommendations.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
