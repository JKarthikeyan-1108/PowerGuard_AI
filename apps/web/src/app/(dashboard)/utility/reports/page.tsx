'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExportDialog } from '@/components/reports/export-dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, MapPin, Search } from 'lucide-react';

const utilityLossData = [
  { area: 'Downtown', technicalLoss: 400, theftLoss: 240 },
  { area: 'North Hills', technicalLoss: 300, theftLoss: 139 },
  { area: 'West End', technicalLoss: 200, theftLoss: 980 },
  { area: 'South Side', technicalLoss: 278, theftLoss: 390 },
  { area: 'East Bay', technicalLoss: 189, theftLoss: 480 },
];

export default function UtilityReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utility Grid Reports</h1>
          <p className="text-muted-foreground mt-1">Export transformer analytics and region-based loss reports.</p>
        </div>
        <ExportDialog reportType="loss" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Transformers</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">4</div>
            <p className="text-xs text-muted-foreground">Operating &gt; 90% load</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Loss Region</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">West End</div>
            <p className="text-xs text-muted-foreground">980 kWh stolen this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspections Pending</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Based on AI anomaly flags</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grid Loss by Area</CardTitle>
          <CardDescription>Comparison of technical line loss versus suspected energy theft.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={utilityLossData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
              <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="area" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="technicalLoss" name="Technical Loss" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="theftLoss" name="Theft (Non-Technical)" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
