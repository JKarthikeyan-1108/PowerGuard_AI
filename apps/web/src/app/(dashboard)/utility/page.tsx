'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { StatsCard } from '@/components/shared/StatsCard';
import { ChartCard, AreaChartComponent, BarChartComponent, LineChartComponent, PieChartComponent } from '@/components/charts/Charts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataSourceBadge } from '@/components/shared/DataSourceBadge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Gauge, ShieldAlert, Zap, AlertTriangle, TrendingUp, Activity,
  MapPin, Wifi, WifiOff, Download, Play, CheckCircle2, AlertCircle, Sparkles, RefreshCw
} from 'lucide-react';
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
  const [liveReadings, setLiveReadings] = useState<any[]>([]);

  // Simulation test state
  const [simLoading, setSimLoading] = useState(false);
  const [lastSimResult, setLastSimResult] = useState<any | null>(null);

  // Alert status management
  const [alertList, setAlertList] = useState([
    { id: 'ALT-1', meter: 'MTR-002', area: 'Anna Nagar West', confidence: 94, severity: 'CRITICAL', status: 'INVESTIGATING', reason: 'Current shunt bypass' },
    { id: 'ALT-2', meter: 'MTR-004', area: 'Industrial Estate', confidence: 88, severity: 'HIGH', status: 'OPEN', reason: 'Load surge > 50A' },
    { id: 'ALT-3', meter: 'MTR-007', area: 'T. Nagar Commercial', confidence: 79, severity: 'HIGH', status: 'INVESTIGATING', reason: 'Low PF phase shift' },
    { id: 'ALT-4', meter: 'MTR-011', area: 'Adyar Residential', confidence: 64, severity: 'MODERATE', status: 'RESOLVED', reason: 'Transient motor start' },
  ]);

  React.useEffect(() => {
    if (isConnected && socket) {
      joinRoom('room:meters_live');
      
      const handleNewReading = (data: any) => {
        setLiveReadings((prev) => {
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

  // Trigger Sensor Simulator via /api/simulator
  const runSimulation = async (mode: 'NORMAL' | 'TAMPER_BYPASS' | 'OVERLOAD') => {
    setSimLoading(true);
    try {
      const res = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meterId: 'MTR-002', mode }),
      });
      const data = await res.json();
      setLastSimResult(data);

      if (data?.ingestResult?.mlInference?.isAnomaly) {
        // Prepend new alert
        setAlertList(prev => [
          {
            id: `ALT-SIM-${Date.now().toString().slice(-4)}`,
            meter: data.reading?.meterId || 'MTR-002',
            area: 'Demo Grid Sector A',
            confidence: Math.round((Math.abs(data.ingestResult.mlInference.anomalyScore) * 5 + 0.75) * 100),
            severity: data.ingestResult.mlInference.riskLevel === 'HIGH_RISK' ? 'CRITICAL' : 'HIGH',
            status: 'OPEN',
            reason: mode === 'TAMPER_BYPASS' ? 'Current shunt bypass' : 'Excessive load surge',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimLoading(false);
    }
  };

  // Toggle Alert Status
  const toggleAlertStatus = (id: string) => {
    setAlertList(prev => prev.map(a => {
      if (a.id !== id) return a;
      const nextStatus = a.status === 'OPEN' ? 'INVESTIGATING' : a.status === 'INVESTIGATING' ? 'CONFIRMED' : a.status === 'CONFIRMED' ? 'RESOLVED' : 'OPEN';
      return { ...a, status: nextStatus };
    }));
  };

  // Export CSV Report
  const downloadCsvReport = () => {
    const headers = ['Alert ID,Meter ID,Area,Severity,Confidence,Status,Reason,Detected At\n'];
    const rows = alertList.map(a => `${a.id},${a.meter},"${a.area}",${a.severity},${a.confidence}%,${a.status},"${a.reason}",${new Date().toISOString()}`);
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `powerguard-theft-alerts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
      {/* ── Top Header with Provenance & Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Utility Operations <span className="text-gradient">Dashboard</span></h1>
            <DataSourceBadge isSimulated={false} dataSource="ESP32_PZEM004T" />
          </div>
          <p className="text-muted-foreground text-sm">Real-time smart meter monitoring, ML theft analytics, and incident review</p>
        </motion.div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadCsvReport} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Download CSV Report
          </Button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${isConnected ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isConnected ? 'Telemetry Active' : 'Offline / Standalone'}
          </div>
        </div>
      </div>

      {/* ── Hackathon Demo: Live Sensor Simulator Interactive Panel ── */}
      <Card className="border-electric-500/30 bg-gradient-to-r from-electric-500/5 via-background to-energy-500/5 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-electric-500" />
                <h3 className="text-sm font-semibold text-foreground">Interactive Hardware & Sensor Simulator</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-electric-500/10 text-electric-600 dark:text-electric-400">
                  Hackathon Live Demo
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Inject calibrated smart meter telemetry into the real-time serverless pipeline to observe instant ML Isolation Forest evaluation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={simLoading}
                onClick={() => runSimulation('NORMAL')}
                className="text-xs gap-1 border-energy-500/30 hover:bg-energy-500/10 hover:text-energy-600"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-energy-500" />
                Simulate Normal (230V / 8.5A)
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={simLoading}
                onClick={() => runSimulation('TAMPER_BYPASS')}
                className="text-xs gap-1 border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                Simulate Shunt Tap (0.08A Anomaly)
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={simLoading}
                onClick={() => runSimulation('OVERLOAD')}
                className="text-xs gap-1 border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Simulate Surge (60A Overload)
              </Button>
            </div>
          </div>

          {/* Simulation Feedback Result */}
          <AnimatePresence>
            {lastSimResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border/50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/30 p-2.5 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    lastSimResult.ingestResult?.mlInference?.isAnomaly
                      ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                      : 'bg-green-500/20 text-green-600 dark:text-green-400'
                  }`}>
                    {lastSimResult.ingestResult?.mlInference?.isAnomaly ? '🚨 ANOMALY ALERT DETECTED' : '✓ NORMAL CONSUMPTION'}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    Meter: {lastSimResult.reading?.meterId} | V: {lastSimResult.reading?.voltage}V | I: {lastSimResult.reading?.current}A | P: {lastSimResult.reading?.power}W | PF: {lastSimResult.reading?.powerFactor}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    Score: <strong className="text-foreground">{lastSimResult.ingestResult?.mlInference?.anomalyScore}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Risk: <strong className="text-foreground">{lastSimResult.ingestResult?.mlInference?.riskLevel}</strong>
                  </span>
                  <DataSourceBadge isSimulated={true} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Consumers" value={stats?.totalConsumers?.toLocaleString() || '1,420'} icon={Users} trend={{ value: 3.2, label: 'this month' }} iconColor="text-electric-500" iconBg="bg-electric-500/10" delay={0} />
        <StatsCard title="Active Meters" value={`${stats?.activeMeters || 128} / ${stats?.totalMeters || 135}`} icon={Gauge} trend={{ value: 1.5, label: 'uptime' }} iconColor="text-energy-500" iconBg="bg-energy-500/10" delay={1} />
        <StatsCard title="Theft Investigations" value={stats?.theftDetections || alertList.length} icon={ShieldAlert} trend={{ value: -12.5, label: 'vs last month' }} iconColor="text-red-500" iconBg="bg-red-500/10" delay={2} />
        <StatsCard title="Critical Alerts" value={alertList.filter(a => a.severity === 'CRITICAL').length} icon={AlertTriangle} iconColor="text-amber-500" iconBg="bg-amber-500/10" delay={3} />
      </div>

      {/* ── Trend Charts ── */}
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

      {/* ── Recent Theft Alerts & Operator Review Table ── */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" /> Meter Tampering & Theft Alerts
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click any alert to transition status (Open → Investigating → Confirmed → Resolved)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{alertList.filter(a => a.status !== 'RESOLVED').length} Active</Badge>
              <Button variant="ghost" size="sm" onClick={downloadCsvReport} className="h-7 text-xs gap-1">
                <Download className="w-3 h-3" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {alertList.map((alert) => (
              <div
                key={alert.id}
                onClick={() => toggleAlertStatus(alert.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-muted/40 transition-colors cursor-pointer gap-2"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`mt-1 sm:mt-0 w-2.5 h-2.5 rounded-full shrink-0 ${
                    alert.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">{alert.meter}</span>
                      <span className="text-xs text-muted-foreground font-normal">({alert.reason})</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {alert.area}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs text-muted-foreground font-medium">{alert.confidence}% confidence</span>
                  <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'outline'}>
                    {alert.severity}
                  </Badge>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    alert.status === 'OPEN'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : alert.status === 'INVESTIGATING'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : alert.status === 'CONFIRMED'
                      ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                      : 'bg-green-500/10 text-green-500 border-green-500/20'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Live Meter Readings Stream ── */}
      <Card className="border-energy-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className={`h-4 w-4 ${isConnected ? 'text-energy-500' : 'text-muted-foreground'}`} /> 
              Live Meter Readings Stream
            </CardTitle>
            <div className="flex items-center gap-2">
              <DataSourceBadge isSimulated={liveReadings.some(r => r.isSimulated)} />
              {isConnected && <div className="flex h-2 w-2 rounded-full bg-energy-500 animate-ping" />}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {liveReadings.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Waiting for incoming smart meter telemetry... (Run sensor simulator or connect ESP32 meter)
              </div>
            ) : (
              liveReadings.map((reading) => (
                <div
                  key={`${reading.serialNumber}-${reading.timestamp}`}
                  className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors"
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
                  
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Voltage</p>
                      <p className="text-xs font-medium">{reading.voltage?.toFixed(1)} V</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Current</p>
                      <p className="text-xs font-medium">{reading.current?.toFixed(2)} A</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Usage</p>
                      <p className="text-xs font-bold text-energy-500">{reading.value?.toFixed(4)} kWh</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
