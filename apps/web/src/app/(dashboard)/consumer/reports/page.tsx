'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExportDialog } from '@/components/reports/export-dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Leaf, DollarSign, Activity } from 'lucide-react';

const consumerEnergyData = [
  { month: 'Jan', usage: 300, avgArea: 320 },
  { month: 'Feb', usage: 280, avgArea: 300 },
  { month: 'Mar', usage: 310, avgArea: 330 },
  { month: 'Apr', usage: 290, avgArea: 310 },
  { month: 'May', usage: 340, avgArea: 360 },
  { month: 'Jun', usage: 380, avgArea: 400 },
];

export default function ConsumerReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Download monthly bills and view your energy impact.</p>
        </div>
        <ExportDialog reportType="billing" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Next Bill</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$42.50</div>
            <p className="text-xs text-muted-foreground">Based on current trajectory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">380 kWh</div>
            <p className="text-xs text-muted-foreground">-5% compared to neighbors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO2 Offset</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">14.2 kg</div>
            <p className="text-xs text-muted-foreground">Saved this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Energy Consumption vs Area Average</CardTitle>
          <CardDescription>See how your household compares to similar houses in your grid.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={consumerEnergyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usage" name="Your Usage (kWh)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="avgArea" name="Area Average (kWh)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
