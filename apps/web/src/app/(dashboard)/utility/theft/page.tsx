'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Activity, CheckCircle2, AlertTriangle, ArrowRight, XCircle } from 'lucide-react';
import { BarChartComponent } from '@/components/charts/Charts';

export default function TheftDetectionPage() {
  const anomalies = [
    { id: 'MTR-99A12', account: 'ACC-55219', score: 0.94, method: 'Direct Bypass Suspected', date: 'Today, 02:30 AM', status: 'CRITICAL' },
    { id: 'MTR-11B34', account: 'ACC-88123', score: 0.88, method: 'Meter Tampering (Cover)', date: 'Yesterday, 11:15 PM', status: 'HIGH' },
    { id: 'MTR-55C99', account: 'ACC-22941', score: 0.76, method: 'Anomalous Usage Drop', date: 'Aug 2, 2026', status: 'MEDIUM' },
    { id: 'MTR-22D88', account: 'ACC-11044', score: 0.91, method: 'Magnetic Interference', date: 'Jul 30, 2026', status: 'HIGH' },
  ];

  const detectionStats = [
    { label: 'Jan', count: 12 },
    { label: 'Feb', count: 15 },
    { label: 'Mar', count: 8 },
    { label: 'Apr', count: 22 },
    { label: 'May', count: 18 },
    { label: 'Jun', count: 25 },
    { label: 'Jul', count: 14 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Theft <span className="text-gradient">Detection</span></h1>
          <p className="text-muted-foreground mt-1">AI-powered identification of electricity theft and meter tampering.</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-3 py-1 text-xs">
              <Activity className="h-3.5 w-3.5" /> AI Engine Active
           </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-destructive/30 shadow-[0_0_15px_rgba(239,68,68,0.05)] md:col-span-1 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Critical Alerts</CardTitle>
            <CardDescription>Immediate action required.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-destructive mb-2">4</div>
            <p className="text-sm text-muted-foreground mb-6">Meters flagged with &gt;90% theft probability in the last 24 hours.</p>
            <Button variant="destructive" className="w-full gap-2">Dispatch Inspectors <ArrowRight className="h-4 w-4" /></Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
           <CardHeader>
              <CardTitle>Detection History</CardTitle>
              <CardDescription>Confirmed theft cases YTD</CardDescription>
           </CardHeader>
           <CardContent>
              <BarChartComponent 
                 data={detectionStats} 
                 xKey="label" 
                 yKey="count" 
                 height={200}
                 color="hsl(var(--destructive))"
              />
           </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Investigations</CardTitle>
          <CardDescription>Meters flagged by the Isolation Forest / XGBoost models.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Meter ID</th>
                  <th className="px-6 py-3 font-medium">Account</th>
                  <th className="px-6 py-3 font-medium">AI Confidence</th>
                  <th className="px-6 py-3 font-medium">Detected Method</th>
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {anomalies.map((anomaly, i) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">{anomaly.id}</td>
                    <td className="px-6 py-4 text-muted-foreground">{anomaly.account}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                             <div 
                                className={`h-1.5 rounded-full ${anomaly.score > 0.9 ? 'bg-destructive' : anomaly.score > 0.8 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                                style={{ width: `${anomaly.score * 100}%` }}
                             />
                          </div>
                          <span className={`text-xs font-bold ${anomaly.score > 0.9 ? 'text-destructive' : anomaly.score > 0.8 ? 'text-amber-500' : 'text-blue-500'}`}>
                             {(anomaly.score * 100).toFixed(1)}%
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant="outline" className="bg-background text-foreground text-[10px] uppercase font-normal tracking-wider">
                          {anomaly.method}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{anomaly.date}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                             <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Confirm
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                             <XCircle className="h-3.5 w-3.5" /> Dismiss
                          </Button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
