'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/providers/SocketProvider';
import { ChartCard, AreaChartComponent, BarChartComponent, LineChartComponent } from '@/components/charts/Charts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Zap, Activity, AlertTriangle, TrendingUp, TrendingDown, Clock, Lightbulb, Bell,
  Shield, ShieldCheck, ShieldAlert, Receipt, BarChart3, Radio,
  ArrowRight, Wifi, WifiOff, DollarSign, FileText, Settings, Eye,
  CheckCircle2, AlertCircle, Info, CircleDot,
} from 'lucide-react';
import type { DashboardStats } from '@/types';

// ── Role Route Helper ───────────────────────────────
function getRoleRoute(role: string | undefined) {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'UTILITY_OFFICER': return '/utility';
    default: return '/consumer';
  }
}

// ── KPI Card Component ──────────────────────────────
interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badge?: { text: string; color: string };
  subMetrics?: { label: string; value: string; color?: string }[];
  trend?: { value: number; label: string };
  statusIcon?: React.ReactNode;
  delay?: number;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title, value, icon: Icon, iconBg, iconColor, badge, subMetrics, trend, statusIcon, delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: delay * 0.1 }}
  >
    <Card className="relative overflow-hidden border-gray-100 dark:border-border/50 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          {badge && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.color}`}>
              <CircleDot className="h-2.5 w-2.5 animate-pulse" />
              {badge.text}
            </span>
          )}
          {statusIcon}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold text-[#1F2937] dark:text-foreground tracking-tight">{value}</p>
        {subMetrics && (
          <div className="flex items-center gap-3 mt-2">
            {subMetrics.map((m) => (
              <span key={m.label} className="text-[11px] text-gray-400 dark:text-muted-foreground">
                {m.label}: <span className={`font-semibold ${m.color || 'text-[#1F2937] dark:text-foreground'}`}>{m.value}</span>
              </span>
            ))}
          </div>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.value >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-[#20C997]" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={`text-xs font-semibold ${trend.value >= 0 ? 'text-[#20C997]' : 'text-red-500'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-[11px] text-gray-400 dark:text-muted-foreground">{trend.label}</span>
          </div>
        )}
        {/* Decorative gradient bar at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${iconBg} opacity-60`} />
      </CardContent>
    </Card>
  </motion.div>
);

// ── Main Dashboard ──────────────────────────────────
export default function ConsumerDashboard() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  // ── API Data ────────────────────
  const { data: stats, isLoading } = useQuery({
    queryKey: ['consumer-overview'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/analytics/overview');
      return data.data;
    },
    refetchInterval: 60000,
  });

  // ── Live Socket Data ────────────
  const [liveAlerts, setLiveAlerts] = useState([
    { type: 'HIGH', title: 'Abnormal consumption pattern detected', time: '2 min ago', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
    { type: 'MEDIUM', title: 'Unusual power spike detected', time: '15 min ago', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { type: 'INFO', title: 'Monthly consumption increased by 8%', time: '1 hr ago', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  ]);

  useEffect(() => {
    if (!socket) return;
    const handleNewAlert = (data: any) => {
      setLiveAlerts(prev => [{
        type: data.severity || 'INFO',
        title: data.title || data.description || 'New alert',
        time: 'Just now',
        icon: data.severity === 'CRITICAL' ? AlertTriangle : data.severity === 'HIGH' ? AlertCircle : Info,
        color: data.severity === 'CRITICAL' ? 'text-red-500' : data.severity === 'HIGH' ? 'text-amber-500' : 'text-blue-500',
        bg: data.severity === 'CRITICAL' ? 'bg-red-50 dark:bg-red-500/10' : data.severity === 'HIGH' ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-blue-50 dark:bg-blue-500/10',
      }, ...prev].slice(0, 5));
    };
    socket.on('alert:new', handleNewAlert);
    return () => { socket.off('alert:new', handleNewAlert); };
  }, [socket]);

  // ── Chart Data ──────────────────
  const [timeFilter, setTimeFilter] = useState<'Live' | '1H' | '6H' | '24H' | '7D'>('Live');
  
  const { data: realtimeData = [] } = useQuery({
    queryKey: ['consumer-realtime', timeFilter],
    queryFn: async () => {
      const { data } = await api.get('/analytics/consumer/realtime-power');
      return data.data;
    },
    refetchInterval: 30000,
  });

  const { data: consumptionData = [] } = useQuery({
    queryKey: ['consumer-consumption'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/consumer/consumption');
      return data.data;
    }
  });

  const { data: billData = [] } = useQuery({
    queryKey: ['consumer-bills'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/consumer/bills');
      return data.data;
    }
  });

  const { data: forecastData = [] } = useQuery({
    queryKey: ['consumer-forecast'],
    queryFn: async () => {
      // Mock forecast data since backend logic wasn't fully mocked for this specifically
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
          date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          lstm: +(2.5 + Math.sin(i / 2) * 0.8 + Math.random() * 0.3).toFixed(2),
          arima: +(2.3 + Math.cos(i / 2) * 0.7 + Math.random() * 0.4).toFixed(2),
          prophet: +(2.7 + Math.sin(i / 3) * 0.6 + Math.random() * 0.2).toFixed(2),
        };
      });
    }
  });

  // Computed KPI values
  const currentPower = stats?.avgDailyUsage ? (stats.avgDailyUsage / 8).toFixed(2) : '2.84';
  const todayConsumption = stats?.avgDailyUsage?.toFixed(2) || '8.42';
  const predictedBill = stats?.predictedBill?.toFixed(0) || '1,842';
  const securityStatus = (stats?.activeAlerts || 0) > 0 ? 'WARNING' : 'SAFE';

  // ── Loading State ───────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══ 1. Welcome Section ═══════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-foreground tracking-tight">
            Welcome back, {user?.firstName}! <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-gray-400 dark:text-muted-foreground mt-1">
            Here&apos;s your electricity and security overview for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
            isConnected
              ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
              : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
          )}>
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {isConnected ? 'System Online' : 'Offline'}
          </div>
          <span className="text-[11px] text-gray-400 dark:text-muted-foreground">
            Last updated: {isConnected ? '10 seconds ago' : 'N/A'}
          </span>
        </div>
      </motion.div>

      {/* ═══ 2. KPI Cards ════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Current Power"
          value={`${currentPower} kW`}
          icon={Zap}
          iconBg="bg-[#2F75B5]/10"
          iconColor="text-[#2F75B5]"
          badge={{ text: 'Live', color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' }}
          subMetrics={[
            { label: 'Voltage', value: '230.6 V', color: 'text-[#2F75B5]' },
            { label: 'Current', value: '12.34 A' },
          ]}
          delay={0}
        />
        <KpiCard
          title="Today's Consumption"
          value={`${todayConsumption} kWh`}
          icon={Activity}
          iconBg="bg-[#20C997]/10"
          iconColor="text-[#20C997]"
          trend={{ value: 5.2, label: 'compared with yesterday' }}
          delay={1}
        />
        <KpiCard
          title="Predicted Monthly Bill"
          value={`₹${predictedBill}`}
          icon={Receipt}
          iconBg="bg-[#0F4C81]/10"
          iconColor="text-[#0F4C81]"
          subMetrics={[{ label: '', value: 'Expected bill for current month' }]}
          delay={2}
        />
        <KpiCard
          title="Security Status"
          value={securityStatus}
          icon={securityStatus === 'SAFE' ? ShieldCheck : ShieldAlert}
          iconBg={securityStatus === 'SAFE' ? 'bg-[#20C997]/10' : 'bg-amber-500/10'}
          iconColor={securityStatus === 'SAFE' ? 'text-[#20C997]' : 'text-amber-500'}
          subMetrics={[{
            label: '',
            value: securityStatus === 'SAFE' ? 'No suspicious activity detected' : `${stats?.activeAlerts || 0} alerts active`,
          }]}
          statusIcon={securityStatus === 'SAFE' ? <CheckCircle2 className="h-6 w-6 text-[#20C997]" /> : undefined}
          delay={3}
        />
      </div>

      {/* ═══ 3. Real-Time Power + 4. Theft + 5. AI ══ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Real-Time Power Consumption Chart */}
        <div className="xl:col-span-7">
          <Card className="border-gray-100 dark:border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold text-[#1F2937] dark:text-foreground">Real-Time Power Consumption</CardTitle>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-400"><span className="w-2.5 h-0.5 rounded-full bg-[#2F75B5] inline-block" /> Power (kW)</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-400"><span className="w-2.5 h-0.5 rounded-full bg-[#20C997] inline-block" /> Voltage (V)</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-400"><span className="w-2.5 h-0.5 rounded-full bg-[#00BFFF] inline-block" /> Current (A)</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-muted rounded-lg p-0.5">
                {(['Live', '1H', '6H', '24H', '7D'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                      timeFilter === f
                        ? 'bg-[#2F75B5] text-white shadow-sm'
                        : 'text-gray-500 dark:text-muted-foreground hover:text-[#1F2937] dark:hover:text-foreground'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <LineChartComponent
                data={realtimeData}
                xKey="time"
                lines={[
                  { key: 'power', color: '#2F75B5', label: 'Power (kW)' },
                  { key: 'voltage', color: '#20C997', label: 'Voltage (V)' },
                  { key: 'current', color: '#00BFFF', label: 'Current (A)' },
                ]}
                height={260}
              />
              {/* Summary below chart */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-border/30">
                {[
                  { label: 'Current Power', value: `${currentPower} kW` },
                  { label: 'Peak Power', value: '3.21 kW', sub: '(Today)' },
                  { label: 'Average Power', value: '2.45 kW', sub: '(Today)' },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-[11px] text-gray-400 dark:text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-bold text-[#1F2937] dark:text-foreground">{m.value}</p>
                    {m.sub && <p className="text-[10px] text-gray-300 dark:text-muted-foreground">{m.sub}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Theft Detection + AI Analysis */}
        <div className="xl:col-span-5 grid grid-rows-2 gap-4">
          {/* Theft Detection */}
          <Card className="border-gray-100 dark:border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
                  <Shield className="h-4 w-4 text-red-500" />
                </div>
                <CardTitle className="text-base font-semibold text-[#1F2937] dark:text-foreground">AI Theft Detection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-muted-foreground">Security Status</span>
                <span className={`text-lg font-bold ${securityStatus === 'SAFE' ? 'text-[#20C997]' : 'text-amber-500'}`}>
                  {securityStatus}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 dark:text-muted-foreground">Risk Score</span>
                  <span className="text-sm font-bold text-[#1F2937] dark:text-foreground">12 <span className="font-normal text-gray-400">/ 100</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-[#20C997]" style={{ width: '12%' }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 dark:text-muted-foreground">Detection Status</span>
                <span className="text-[#1F2937] dark:text-foreground font-medium">No anomaly detected</span>
              </div>
              <p className="text-[10px] text-gray-300 dark:text-muted-foreground">Latest analysis: 2 minutes ago</p>
              <Link
                href={`${getRoleRoute(user?.role)}/alerts`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F75B5] hover:text-[#0F4C81] transition-colors mt-1"
              >
                View Theft Analytics <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="border-gray-100 dark:border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#1F2937] dark:text-foreground">AI Analysis</CardTitle>
              <Link href={`${getRoleRoute(user?.role)}/alerts`} className="text-[11px] font-medium text-[#2F75B5]">View Details</Link>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                { model: 'Isolation Forest', score: '0.12', risk: 'Low', riskColor: 'text-[#20C997]' },
                { model: 'Random Forest', score: '', risk: 'Low', riskColor: 'text-[#20C997]' },
                { model: 'XGBoost', score: '94%', risk: '', riskColor: '' },
              ].map((m) => (
                <div key={m.model} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#1F2937] dark:text-foreground">{m.model}</p>
                    {m.score && (
                      <p className="text-[10px] text-gray-400 dark:text-muted-foreground">
                        {m.model === 'XGBoost' ? 'Confidence Score' : 'Anomaly Score'}: <span className="font-semibold text-[#1F2937] dark:text-foreground">{m.score}</span>
                      </p>
                    )}
                  </div>
                  {m.risk && (
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Risk Level</p>
                      <p className={`text-xs font-bold ${m.riskColor}`}>{m.risk}</p>
                    </div>
                  )}
                  {!m.risk && m.score && (
                    <p className={`text-sm font-bold text-[#2F75B5]`}>{m.score}</p>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 dark:border-border/30 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1F2937] dark:text-foreground">Overall Assessment</span>
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> System Normal
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ 6. Consumption + 7. Bill + 8. Forecast ═ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Energy Consumption */}
        <Card className="border-gray-100 dark:border-border/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#1F2937] dark:text-foreground">Energy Consumption</CardTitle>
            <span className="text-[11px] text-gray-400 dark:text-muted-foreground">This Month ▾</span>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Total Consumption</p>
                <p className="text-sm font-bold text-[#2F75B5]">{stats?.totalConsumption?.toFixed(1) || '248.6'} kWh</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Daily Average</p>
                <p className="text-sm font-bold text-[#20C997]">{stats?.avgDailyUsage?.toFixed(2) || '8.29'} kWh</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Peak Usage Time</p>
                <p className="text-sm font-bold text-amber-500">6 PM - 10 PM</p>
              </div>
            </div>
            <BarChartComponent data={consumptionData} xKey="day" yKey="usage" height={180} color="#2F75B5" />
          </CardContent>
        </Card>

        {/* Predicted Bill */}
        <Card className="border-gray-100 dark:border-border/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#1F2937] dark:text-foreground">Predicted Electricity Bill</CardTitle>
            <span className="text-[11px] text-gray-400 dark:text-muted-foreground">This Month ▾</span>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Estimated Bill</p>
                <p className="text-xl font-bold text-[#0F4C81]">₹{predictedBill}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Expected Range</p>
                <p className="text-sm font-bold text-[#1F2937] dark:text-foreground">₹1,700 - ₹1,950</p>
              </div>
            </div>
            <LineChartComponent
              data={billData}
              xKey="month"
              lines={[
                { key: 'previous', color: '#9CA3AF', label: 'Previous Month', dashed: true },
                { key: 'predicted', color: '#2F75B5', label: 'Predicted' },
              ]}
              height={180}
            />
            <Link
              href={`${getRoleRoute(user?.role)}/billing`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F75B5] hover:text-[#0F4C81] transition-colors mt-3"
            >
              View Bill Prediction <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Demand Forecast */}
        <Card className="border-gray-100 dark:border-border/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#1F2937] dark:text-foreground">Electricity Demand Forecast</CardTitle>
            <span className="text-[11px] text-gray-400 dark:text-muted-foreground">7 Days ▾</span>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Predicted Peak Demand</p>
                <p className="text-sm font-bold text-red-500">3.65 kW</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-muted-foreground">Average Demand</p>
                <p className="text-sm font-bold text-[#1F2937] dark:text-foreground">2.48 kW</p>
              </div>
            </div>
            <LineChartComponent
              data={forecastData}
              xKey="date"
              lines={[
                { key: 'lstm', color: '#2F75B5', label: 'LSTM' },
                { key: 'arima', color: '#20C997', label: 'ARIMA' },
                { key: 'prophet', color: '#00BFFF', label: 'Prophet' },
              ]}
              height={180}
            />
            <div className="flex items-center gap-4 mt-2">
              {[
                { label: 'LSTM', color: 'bg-[#2F75B5]' },
                { label: 'ARIMA', color: 'bg-[#20C997]' },
                { label: 'Prophet', color: 'bg-[#00BFFF]' },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${l.color}`} /> {l.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ 9. Alerts + 10. Devices ═════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Alerts */}
        <Card className="border-gray-100 dark:border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#1F2937] dark:text-foreground flex items-center gap-2">
              Recent Alerts
            </CardTitle>
            <Link href={`${getRoleRoute(user?.role)}/alerts`} className="text-[11px] font-semibold text-[#2F75B5]">View All</Link>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {liveAlerts.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className={`flex items-start gap-3 p-3 rounded-lg ${alert.bg} transition-colors cursor-pointer`}
              >
                <Badge variant={alert.type === 'HIGH' ? 'danger' : alert.type === 'MEDIUM' ? 'warning' : 'info'} className="shrink-0 text-[9px] px-1.5 py-0">
                  {alert.type}
                </Badge>
                <p className="text-xs font-medium text-[#1F2937] dark:text-foreground flex-1">{alert.title}</p>
                <span className="text-[10px] text-gray-400 dark:text-muted-foreground whitespace-nowrap shrink-0">{alert.time}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Connected Devices */}
        <Card className="border-gray-100 dark:border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#1F2937] dark:text-foreground">Connected Devices</CardTitle>
            <Link href={`${getRoleRoute(user?.role)}/monitoring`} className="text-[11px] font-semibold text-[#2F75B5]">View All</Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-border/30">
                    <th className="text-left py-2 font-semibold text-gray-400 dark:text-muted-foreground">Device ID</th>
                    <th className="text-left py-2 font-semibold text-gray-400 dark:text-muted-foreground">Device</th>
                    <th className="text-left py-2 font-semibold text-gray-400 dark:text-muted-foreground">Status</th>
                    <th className="text-right py-2 font-semibold text-gray-400 dark:text-muted-foreground">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'VG-MTR-001', device: 'ESP32 + PZEM-004T', status: 'Online', statusColor: 'text-[#20C997]', dotColor: 'bg-[#20C997]', time: '10 sec ago' },
                    { id: 'VG-MTR-002', device: 'ESP32 + PZEM-004T', status: 'Online', statusColor: 'text-[#20C997]', dotColor: 'bg-[#20C997]', time: '12 sec ago' },
                    { id: 'VG-MTR-003', device: 'ESP32 + PZEM-004T', status: 'Warning', statusColor: 'text-amber-500', dotColor: 'bg-amber-500', time: '45 sec ago' },
                    { id: 'VG-MTR-004', device: 'ESP32 + PZEM-004T', status: 'Offline', statusColor: 'text-red-500', dotColor: 'bg-red-500', time: '5 min ago' },
                  ].map((d) => (
                    <tr key={d.id} className="border-b border-gray-50 dark:border-border/20 hover:bg-gray-50/50 dark:hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-mono font-semibold text-[#1F2937] dark:text-foreground">{d.id}</td>
                      <td className="py-2.5 text-gray-500 dark:text-muted-foreground">{d.device}</td>
                      <td className="py-2.5">
                        <span className={`flex items-center gap-1.5 font-semibold ${d.statusColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${d.dotColor} ${d.status === 'Online' ? 'animate-pulse' : ''}`} />
                          {d.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-gray-400 dark:text-muted-foreground">{d.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ 11. Recommendations ═════════════════════ */}
      <Card className="border-gray-100 dark:border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#1F2937] dark:text-foreground">AI Energy Saving Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '💡',
                title: 'High Usage Detected',
                desc: 'Your evening consumption is higher than your weekly average.',
                action: 'Review usage patterns',
                color: 'border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5',
              },
              {
                icon: '⚡',
                title: 'Peak Hours',
                desc: 'Consider shifting non-essential appliance usage outside 6 PM – 10 PM.',
                action: 'Set smart schedule',
                color: 'border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5',
              },
              {
                icon: '💰',
                title: 'Bill Optimization',
                desc: 'Reducing peak-hour consumption could lower your estimated monthly bill.',
                action: 'View savings plan',
                color: 'border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/5',
              },
            ].map((rec) => (
              <div key={rec.title} className={`rounded-xl border p-4 ${rec.color} transition-all hover:shadow-sm`}>
                <span className="text-2xl">{rec.icon}</span>
                <h4 className="text-sm font-semibold text-[#1F2937] dark:text-foreground mt-2">{rec.title}</h4>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1 leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══ 12. Quick Actions ═══════════════════════ */}
      <Card className="border-gray-100 dark:border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#1F2937] dark:text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Live Monitoring', href: `${getRoleRoute(user?.role)}/monitoring`, icon: Activity, color: 'bg-[#2F75B5] hover:bg-[#0F4C81]' },
              { label: 'Check Alerts', href: `${getRoleRoute(user?.role)}/alerts`, icon: Bell, color: 'bg-[#20C997] hover:bg-[#1aab82]' },
              { label: 'Bill Prediction', href: `${getRoleRoute(user?.role)}/billing`, icon: Receipt, color: 'bg-[#0F4C81] hover:bg-[#0a3a66]' },
              { label: 'Generate Report', href: `${getRoleRoute(user?.role)}/reports`, icon: FileText, color: 'bg-amber-500 hover:bg-amber-600' },
              { label: 'Manage Meter', href: `${getRoleRoute(user?.role)}/settings`, icon: Settings, color: 'bg-red-500 hover:bg-red-600' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-xs font-semibold shadow-sm ${action.color} transition-all active:scale-95`}
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
