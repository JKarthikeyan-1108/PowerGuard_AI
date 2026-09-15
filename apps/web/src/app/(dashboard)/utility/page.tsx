'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { StatsCard } from '@/components/shared/StatsCard';
import { ChartCard, AreaChartComponent, BarChartComponent, LineChartComponent, PieChartComponent } from '@/components/charts/Charts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Users, Gauge, ShieldAlert, Zap, AlertTriangle, TrendingUp, Activity, MapPin, Wifi, WifiOff } from 'lucide-react';
import type { DashboardStats } from '@/types';
import { useSocket } from '@/hooks/useSocket';

export default function UtilityDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['utility-overview'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/analytics/overview');
      return data.data;
    },
    refetchInterval: 15000,
  });

  // Real-time socket integration
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket('/utility');
  const [liveReadings, setLiveReadings] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (isConnected && socket) {
      joinRoom('room:meters_live');
      
      const handleNewReading = (data: any) => {
        setLiveReadings((prev) => {
          // Keep only the 5 most recent readings for the live feed
          const exists = prev.findIndex(r => r.serialNumber === data.serialNumber);
          let newArray = [...prev];
          if (exists !== -1) newArray[exists] = data;
          else newArray = [data, ...prev];
          
          return newArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
        });
      };

      socket.on('meter:new-reading', handleNewReading);

      return () => {
        socket.off('meter:new-reading', handleNewReading);
        leaveRoom('room:meters_live');
      };
    }
  }, [isConnected, socket, joinRoom, leaveRoom]);

  const { data: chartData, isLoading: isChartsLoading } = useQuery({
    queryKey: ['utility-charts'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/utility/charts');
      return data.data;
    },
    refetchInterval: 60000,
  });

  const theftTrendData = chartData?.theftTrendData || [];
  const areaDemandData = chartData?.areaDemandData || [];
  const riskDistribution = chartData?.riskDistribution || [];
  const loadData = chartData?.loadData || [];

  if (isLoading || isChartsLoading) {
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
          <h1 className="text-2xl font-bold tracking-tight">Utility Operations <span className="text-gradient">Dashboard</span></h1>
          <p className="text-muted-foreground mt-1">System-wide monitoring and analytics</p>
        </motion.div>
        
        {/* Real-time connection status indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${isConnected ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {isConnected ? 'Live Telemetry Active' : 'Telemetry Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Consumers" value={stats?.totalConsumers?.toLocaleString() || '0'} icon={Users} trend={{ value: 3.2, label: 'this month' }} iconColor="text-electric-500" iconBg="bg-electric-500/10" delay={0} />
        <StatsCard title="Active Meters" value={`${stats?.activeMeters || 0} / ${stats?.totalMeters || 0}`} icon={Gauge} trend={{ value: 1.5, label: 'uptime' }} iconColor="text-energy-500" iconBg="bg-energy-500/10" delay={1} />
        <StatsCard title="Theft Detections" value={stats?.theftDetections || 0} icon={ShieldAlert} trend={{ value: -12.5, label: 'vs last month' }} iconColor="text-red-500" iconBg="bg-red-500/10" delay={2} />
        <StatsCard title="Critical Alerts" value={stats?.criticalAlerts || 0} icon={AlertTriangle} iconColor="text-amber-500" iconBg="bg-amber-500/10" delay={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Theft Detection Trend" subtitle="Monthly detection vs resolution" className="lg:col-span-2">
          <LineChartComponent data={theftTrendData} xKey="month" lines={[
            { key: 'detected', color: 'hsl(0, 84%, 60%)', label: 'Detected' },
            { key: 'resolved', color: 'hsl(160, 60%, 45%)', label: 'Resolved' },
          ]} height={280} />
        </ChartCard>

        <ChartCard title="Risk Distribution" subtitle="Consumer risk levels">
          <PieChartComponent data={riskDistribution} height={240} />
          <div className="mt-2 space-y-1">
            {riskDistribution.map((d: any, i: number) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['hsl(160,60%,45%)', 'hsl(30,80%,55%)', 'hsl(0,84%,60%)', 'hsl(280,65%,60%)'][i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Area-wise Demand" subtitle="Current demand by area (kWh)">
          <BarChartComponent data={areaDemandData} xKey="area" yKey="demand" height={280} color="hsl(243, 75%, 59%)" />
        </ChartCard>

        <ChartCard title="Grid Load vs Capacity" subtitle="24-hour transformer load">
          <AreaChartComponent data={loadData} xKey="hour" yKey="load" yKey2="capacity" height={280} />
        </ChartCard>
      </div>

      {/* Recent Theft Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500" /> Recent Theft Alerts
            </CardTitle>
            <Badge variant="danger">{stats?.theftDetections || 0} active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { meter: 'MTR-A1B2C3D4', area: 'Westside Heights', confidence: 94, severity: 'CRITICAL' },
              { meter: 'MTR-E5F6G7H8', area: 'Industrial Park East', confidence: 87, severity: 'HIGH' },
              { meter: 'MTR-I9J0K1L2', area: 'Southfield Industrial', confidence: 78, severity: 'HIGH' },
              { meter: 'MTR-M3N4O5P6', area: 'Downtown District', confidence: 65, severity: 'MODERATE' },
            ].map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={`w-2 h-2 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' : alert.severity === 'HIGH' ? 'bg-amber-500' : 'bg-yellow-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium font-mono">{alert.meter}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{alert.area}</p>
                </div>
                <div className="text-right">
                  <Badge variant={alert.severity === 'CRITICAL' ? 'danger' : alert.severity === 'HIGH' ? 'warning' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{alert.confidence}% confidence</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Meter Readings Stream */}
      <Card className="border-energy-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className={`h-4 w-4 ${isConnected ? 'text-energy-500' : 'text-muted-foreground'}`} /> 
              Live Meter Readings Stream
            </CardTitle>
            {isConnected && <div className="flex h-2 w-2 rounded-full bg-energy-500 animate-ping" />}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {liveReadings.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {isConnected ? 'Waiting for incoming telemetry data...' : 'Connect to MQTT stream to see live readings.'}
              </div>
            ) : (
              liveReadings.map((reading, i) => (
                <motion.div
                  key={`${reading.serialNumber}-${reading.timestamp}`}
                  initial={{ opacity: 0, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                  animate={{ opacity: 1, backgroundColor: 'transparent' }}
                  transition={{ duration: 1 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-energy-500/10 flex items-center justify-center text-energy-500">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium font-mono">{reading.serialNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(reading.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Voltage</p>
                      <p className="text-sm font-medium">{reading.voltage?.toFixed(1)} V</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-sm font-medium">{reading.current?.toFixed(2)} A</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Usage</p>
                      <p className="text-sm font-bold text-energy-500">{reading.value?.toFixed(4)} kWh</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
