'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/providers/SocketProvider';
import { StatsCard } from '@/components/shared/StatsCard';
import { ChartCard, AreaChartComponent, BarChartComponent, PieChartComponent } from '@/components/charts/Charts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Zap, Activity, AlertTriangle, DollarSign, TrendingUp, Clock, Lightbulb, Bell } from 'lucide-react';
import type { DashboardStats } from '@/types';

export default function ConsumerDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['consumer-overview'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/analytics/overview');
      return data.data;
    },
    refetchInterval: 60000, // Reduced polling, rely more on sockets
  });

  const { socket } = useSocket();
  const [liveReadings, setLiveReadings] = React.useState<any[]>([]);
  const [liveAlerts, setLiveAlerts] = React.useState<any[]>([
    { title: 'High usage detected', desc: 'Usage 40% above average between 6-9 PM', severity: 'warning' as const, time: '2 hours ago' },
    { title: 'Bill prediction updated', desc: 'Estimated bill: $142.50 for this month', severity: 'info' as const, time: '5 hours ago' },
  ]);

  React.useEffect(() => {
    if (!socket) return;

    const handleNewReading = (data: any) => {
      setLiveReadings(prev => {
        const newReadings = [...prev, data];
        // Keep last 24 readings
        if (newReadings.length > 24) newReadings.shift();
        return newReadings;
      });
    };

    const handleNewAlert = (data: any) => {
      setLiveAlerts(prev => {
        const newAlert = {
          title: data.title || 'New Alert',
          desc: data.description || 'System generated alert',
          severity: data.severity === 'CRITICAL' ? 'warning' : 'info',
          time: 'Just now'
        };
        return [newAlert, ...prev].slice(0, 5); // Keep top 5
      });
    };

    socket.on('meter:new-reading', handleNewReading);
    socket.on('alert:new', handleNewAlert);

    return () => {
      socket.off('meter:new-reading', handleNewReading);
      socket.off('alert:new', handleNewAlert);
    };
  }, [socket]);

  // Generate sample time-series data from readings

  const consumptionData = React.useMemo(() => {
    if (!stats?.readings?.length) {
      // Fallback demo data
      return Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        consumption: Math.random() * 3 + 0.5,
        average: 1.8,
      }));
    }
    
    const grouped: Record<string, number[]> = {};
    stats.readings.forEach((r) => {
      const hour = new Date(r.timestamp).getHours();
      const key = `${String(hour).padStart(2, '0')}:00`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r.value);
    });

    return Object.entries(grouped).map(([hour, values]) => ({
      hour,
      consumption: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
      average: 1.8,
    }));
  }, [stats, liveReadings]);

  const weeklyData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({
      day,
      usage: parseFloat((Math.random() * 30 + 15).toFixed(1)),
    }));
  }, []);

  const distributionData = [
    { name: 'Lighting', value: 25 },
    { name: 'HVAC', value: 35 },
    { name: 'Appliances', value: 20 },
    { name: 'Electronics', value: 12 },
    { name: 'Other', value: 8 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, <span className="text-gradient-premium">{user?.firstName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your energy overview for today</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Consumption"
          value={`${stats?.totalConsumption?.toLocaleString() || '0'} kWh`}
          subtitle="Last 30 days"
          icon={Zap}
          trend={{ value: -5.2, label: 'vs last month' }}
          iconColor="text-electric-500"
          iconBg="bg-electric-500/10"
          delay={0}
        />
        <StatsCard
          title="Avg Daily Usage"
          value={`${stats?.avgDailyUsage || '0'} kWh`}
          subtitle="Current month"
          icon={Activity}
          trend={{ value: 2.1, label: 'vs last month' }}
          iconColor="text-energy-500"
          iconBg="bg-energy-500/10"
          delay={1}
        />
        <StatsCard
          title="Predicted Bill"
          value={`$${stats?.predictedBill?.toFixed(2) || '0.00'}`}
          subtitle="This month estimate"
          icon={DollarSign}
          trend={{ value: -8.3, label: 'vs last month' }}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          delay={2}
        />
        <StatsCard
          title="Active Alerts"
          value={stats?.activeAlerts || 0}
          subtitle="Requires attention"
          icon={AlertTriangle}
          iconColor={stats?.activeAlerts ? 'text-red-500' : 'text-energy-500'}
          iconBg={stats?.activeAlerts ? 'bg-red-500/10' : 'bg-energy-500/10'}
          delay={3}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Today's Consumption" subtitle="Hourly usage pattern" className="lg:col-span-2">
          <AreaChartComponent data={consumptionData} xKey="hour" yKey="consumption" yKey2="average" height={280} />
        </ChartCard>

        <ChartCard title="Energy Distribution" subtitle="By category">
          <PieChartComponent data={distributionData} height={280} />
          <div className="mt-2 grid grid-cols-2 gap-1">
            {distributionData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['hsl(243,75%,59%)', 'hsl(160,60%,45%)', 'hsl(30,80%,55%)', 'hsl(280,65%,60%)', 'hsl(340,75%,55%)'][i] }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Weekly Usage" subtitle="Last 7 days">
          <BarChartComponent data={weeklyData} xKey="day" yKey="usage" height={250} color="hsl(160, 60%, 45%)" />
        </ChartCard>

        {/* Quick Actions / Recent Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveAlerts.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  alert.severity === 'warning' ? 'bg-amber-500' : alert.severity === 'success' ? 'bg-energy-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.desc}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{alert.time}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tips Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-gradient-to-r from-electric-500/5 via-energy-500/5 to-transparent border-electric-500/20">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-energy-500/10">
              <Lightbulb className="h-5 w-5 text-energy-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">💡 Energy Saving Tip</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your peak usage is between 6-9 PM. Shifting 30% of appliance usage to off-peak hours could save you ~$18/month.
              </p>
            </div>
            <Badge variant="success">Save $18/mo</Badge>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
