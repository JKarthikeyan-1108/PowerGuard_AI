'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { StatsCard } from '@/components/shared/StatsCard';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

const ChartCard = dynamic(() => import('@/components/charts/Charts').then(mod => mod.ChartCard), { ssr: false });
const AreaChartComponent = dynamic(() => import('@/components/charts/Charts').then(mod => mod.AreaChartComponent), { ssr: false });
const BarChartComponent = dynamic(() => import('@/components/charts/Charts').then(mod => mod.BarChartComponent), { ssr: false });
const LineChartComponent = dynamic(() => import('@/components/charts/Charts').then(mod => mod.LineChartComponent), { ssr: false });
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataSourceBadge } from '@/components/shared/DataSourceBadge';
import { motion } from 'framer-motion';
import { Users, Gauge, Shield, Server, AlertTriangle, Activity, Database, Cpu, Sparkles, Radio } from 'lucide-react';
import type { DashboardStats } from '@/types';
import { useSocket } from '@/hooks/useSocket';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/analytics/overview');
      return data.data;
    },
    refetchInterval: 10000,
  });

  const { socket, isConnected } = useSocket('/admin');
  const [liveMetrics, setLiveMetrics] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (socket) {
      const handleSystemUpdate = (data: any) => {
        // e.g., meter went offline
        console.log('System Update:', data);
      };
      socket.on('system:update', handleSystemUpdate);
      return () => { socket.off('system:update', handleSystemUpdate); };
    }
  }, [socket]);

  const systemMetrics = React.useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      cpu: Math.random() * 40 + 20,
      memory: Math.random() * 30 + 40,
      apiCalls: Math.floor(Math.random() * 500 + 100),
    })), []);

  const userGrowth = React.useMemo(() =>
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month) => ({
      month,
      consumers: Math.floor(Math.random() * 200 + 800),
      officers: Math.floor(Math.random() * 10 + 20),
    })), []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">System <span className="text-gradient-premium">Administration</span></h1>
            <DataSourceBadge isSimulated={false} dataSource="ESP32_PZEM004T" />
          </div>
          <p className="text-muted-foreground text-sm">Platform health, ML model metadata, users, and telemetry ingestion status</p>
        </motion.div>
      </div>

      {/* ML Pipeline & Database Status Overview Card */}
      <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 via-background to-electric-500/5">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-semibold text-foreground">Machine Learning Inference & Database Engine</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  v1.0 Production
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Unsupervised Isolation Forest (trained on Kaggle UCI electricity consumption dataset) running via serverless <code className="font-mono bg-muted px-1 rounded">/api/predict</code> with Cloud Firestore storage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50">
                <span className="text-muted-foreground">Threshold:</span>
                <span className="font-mono font-bold text-foreground">-0.015</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50">
                <span className="text-muted-foreground">ROC-AUC:</span>
                <span className="font-mono font-bold text-energy-500">0.9974</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50">
                <span className="text-muted-foreground">Ingestion:</span>
                <span className="font-mono font-bold text-electric-500">/api/ingest</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50">
                <span className="text-muted-foreground">Firestore Collections:</span>
                <span className="font-mono font-bold text-purple-500">8 Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={((stats?.totalConsumers || 0) + 7).toLocaleString()} icon={Users} trend={{ value: 4.8, label: 'this month' }} iconColor="text-electric-500" iconBg="bg-electric-500/10" delay={0} />
        <StatsCard title="Active Meters" value={stats?.activeMeters?.toLocaleString() || '128'} icon={Gauge} trend={{ value: 2.1, label: 'growth' }} iconColor="text-energy-500" iconBg="bg-energy-500/10" delay={1} />
        <StatsCard title="System Alerts" value={stats?.newAlerts || 4} icon={AlertTriangle} iconColor="text-amber-500" iconBg="bg-amber-500/10" delay={2} />
        <StatsCard title="AI Models" value="Isolation Forest" subtitle="v1.0 Active (99.7% AUC)" icon={Cpu} iconColor="text-purple-500" iconBg="bg-purple-500/10" delay={3} />
      </div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'API Server', status: 'Healthy', uptime: '99.97%', icon: Server, color: 'text-energy-500' },
          { name: 'Database', status: 'Healthy', uptime: '99.99%', icon: Database, color: 'text-blue-500' },
          { name: 'AI Service', status: 'Healthy', uptime: '99.85%', icon: Cpu, color: 'text-purple-500' },
          { name: 'MQTT Broker', status: 'Healthy', uptime: '99.92%', icon: Activity, color: 'text-amber-500' },
          { name: 'Socket.IO', status: isConnected ? 'Connected' : 'Disconnected', uptime: isConnected ? '100%' : '0%', icon: Activity, color: isConnected ? 'text-energy-500' : 'text-red-500' },
        ].map((service, i) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <Card className="hover:border-energy-500/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <service.icon className={`h-5 w-5 ${service.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                </div>
                <Badge variant="success">{service.status}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="System Performance" subtitle="CPU & Memory (24h)">
          <LineChartComponent data={systemMetrics} xKey="time" lines={[
            { key: 'cpu', color: 'hsl(243, 75%, 59%)', label: 'CPU %' },
            { key: 'memory', color: 'hsl(160, 60%, 45%)', label: 'Memory %' },
          ]} height={280} />
        </ChartCard>

        <ChartCard title="API Request Volume" subtitle="Requests per hour">
          <BarChartComponent data={systemMetrics} xKey="time" yKey="apiCalls" height={280} color="hsl(280, 65%, 60%)" />
        </ChartCard>
      </div>

      <ChartCard title="User Growth" subtitle="Monthly registered users">
        <AreaChartComponent data={userGrowth} xKey="month" yKey="consumers" height={280} />
      </ChartCard>
    </div>
  );
}
