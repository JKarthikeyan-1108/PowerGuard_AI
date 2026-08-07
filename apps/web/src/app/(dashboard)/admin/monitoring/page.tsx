'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HeartPulse, Server, Database, Activity, Cpu, HardDrive, Network, RefreshCw,
  Wifi, WifiOff, Zap, AlertTriangle, BarChart3, Clock, ArrowUpRight,
  ArrowDownRight, Minus, Radio, Globe, Gauge, MonitorSmartphone,
} from 'lucide-react';
import {
  AreaChartComponent, LineChartComponent, BarChartComponent, PieChartComponent,
} from '@/components/charts/Charts';
import api from '@/lib/api';

// ── Types ────────────────────────────────────────────────

interface ServiceStatus {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
  latencyMs: number;
  uptime: string;
  version?: string;
  details?: Record<string, any>;
  lastChecked: string;
}

interface HealthDashboard {
  overall: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  score: number;
  timestamp: string;
  services: ServiceStatus[];
  system: {
    cpu: { usagePercent: number; cores: number; model: string; loadAvg: number[] };
    memory: { totalBytes: number; usedBytes: number; freeBytes: number; usagePercent: number };
    process: { pid: number; uptimeSeconds: number; memoryMB: number; nodeVersion: string };
    network: { hostname: string; interfaces: { name: string; address: string }[] };
  };
  api: {
    totalRequests: number;
    requestsPerMinute: number;
    avgResponseTimeMs: number;
    errorRate: number;
    statusCodes: Record<string, number>;
    slowestEndpoints: { path: string; avgMs: number; count: number }[];
  };
  devices: {
    totalMeters: number;
    activeMeters: number;
    offlineMeters: number;
    faultyMeters: number;
    tamperedMeters: number;
    connectedNow: number;
    recentReadings: number;
    readingsPerMinute: number;
  };
  ai: {
    status: string;
    latencyMs: number;
    modelsLoaded: number;
    totalPredictions: number;
    avgInferenceTimeMs: number;
    models: { name: string; version: string; status: string; accuracy?: number }[];
  };
  mqtt: {
    connected: boolean;
    messagesReceived: number;
    messagesPerMinute: number;
    topicsSubscribed: number;
    lastMessageAt: string | null;
    reconnects: number;
  };
  socket: {
    connected: boolean;
    totalConnections: number;
    namespaceCounts: Record<string, number>;
    roomCount: number;
  };
}

// ── Helpers ──────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function statusColor(status: string): string {
  switch (status) {
    case 'HEALTHY': return 'text-emerald-500';
    case 'DEGRADED': return 'text-amber-500';
    case 'DOWN': return 'text-red-500';
    default: return 'text-muted-foreground';
  }
}

function statusBg(status: string): string {
  switch (status) {
    case 'HEALTHY': return 'bg-emerald-500/10 border-emerald-500/20';
    case 'DEGRADED': return 'bg-amber-500/10 border-amber-500/20';
    case 'DOWN': return 'bg-red-500/10 border-red-500/20';
    default: return 'bg-muted/50';
  }
}

function scoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-emerald-400';
  if (score >= 50) return 'from-amber-500 to-amber-400';
  return 'from-red-500 to-red-400';
}

// ── Component ───────────────────────────────────────────

export default function MonitoringDashboardPage() {
  const [dashboard, setDashboard] = useState<HealthDashboard | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, histRes] = await Promise.all([
        api.get('/monitoring/dashboard'),
        api.get('/monitoring/history'),
      ]);
      setDashboard(dashRes.data.data);
      setHistory(histRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    if (!autoRefresh) return;
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboard, autoRefresh]);

  if (loading || !dashboard) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <HeartPulse className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  const cpuHistory = history.map((h: any, i: number) => ({
    time: new Date(h.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    cpu: h.cpu,
    memory: h.memory,
  }));

  const apiHistory = history.map((h: any) => ({
    time: new Date(h.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    rpm: h.requestsPerMinute,
    errorRate: h.errorRate,
  }));

  const statusCodeData = Object.entries(dashboard.api.statusCodes).map(([name, value]) => ({ name, value }));

  const devicePieData = [
    { name: 'Active', value: dashboard.devices.activeMeters },
    { name: 'Offline', value: dashboard.devices.offlineMeters },
    { name: 'Faulty', value: dashboard.devices.faultyMeters },
    { name: 'Tampered', value: dashboard.devices.tamperedMeters },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Observability <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">&amp; Monitoring</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Enterprise-grade health monitoring across all subsystems
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchDashboard} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* ── Health Score Banner ──────────────────────────── */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <Card className={`border ${statusBg(dashboard.overall)} overflow-hidden`}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`relative h-20 w-20 rounded-full border-4 ${dashboard.overall === 'HEALTHY' ? 'border-emerald-500' : dashboard.overall === 'DEGRADED' ? 'border-amber-500' : 'border-red-500'} flex items-center justify-center`}>
                  <span className={`text-2xl font-bold bg-gradient-to-b ${scoreGradient(dashboard.score)} bg-clip-text text-transparent`}>
                    {dashboard.score}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">System Health</h2>
                    <Badge className={`${statusBg(dashboard.overall)} ${statusColor(dashboard.overall)} border`}>
                      {dashboard.overall}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dashboard.services.filter(s => s.status === 'HEALTHY').length}/{dashboard.services.length} services operational •
                    Uptime {formatUptime(dashboard.system.process.uptimeSeconds)} •
                    PID {dashboard.system.process.pid}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{dashboard.api.requestsPerMinute}</p>
                  <p className="text-muted-foreground">req/min</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{dashboard.api.avgResponseTimeMs}ms</p>
                  <p className="text-muted-foreground">avg latency</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${dashboard.api.errorRate > 5 ? 'text-red-500' : 'text-foreground'}`}>{dashboard.api.errorRate}%</p>
                  <p className="text-muted-foreground">error rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Service Status Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {dashboard.services.map((service, idx) => (
          <motion.div key={service.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.05 }}>
            <Card className={`border ${statusBg(service.status)} h-full hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-1.5 rounded-lg ${statusBg(service.status)}`}>
                    {service.name.includes('MySQL') ? <Database className={`h-4 w-4 ${statusColor(service.status)}`} /> :
                     service.name.includes('AI') ? <Activity className={`h-4 w-4 ${statusColor(service.status)}`} /> :
                     service.name.includes('MQTT') ? <Radio className={`h-4 w-4 ${statusColor(service.status)}`} /> :
                     service.name.includes('Socket') ? <Globe className={`h-4 w-4 ${statusColor(service.status)}`} /> :
                     <Server className={`h-4 w-4 ${statusColor(service.status)}`} />}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${statusColor(service.status)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${service.status === 'HEALTHY' ? 'bg-emerald-500' : service.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                    {service.status}
                  </div>
                </div>
                <h3 className="text-sm font-semibold truncate">{service.name}</h3>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Latency</span><span className="font-medium text-foreground">{service.latencyMs}ms</span></div>
                  <div className="flex justify-between"><span>Uptime</span><span className="font-medium text-foreground">{service.uptime}</span></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Tabbed Detail Sections ───────────────────────── */}
      <Tabs defaultValue="system" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="system" className="gap-1.5"><Cpu className="h-3.5 w-3.5" /> System</TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> API</TabsTrigger>
          <TabsTrigger value="devices" className="gap-1.5"><MonitorSmartphone className="h-3.5 w-3.5" /> Devices</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> AI</TabsTrigger>
          <TabsTrigger value="infra" className="gap-1.5"><Network className="h-3.5 w-3.5" /> Infra</TabsTrigger>
        </TabsList>

        {/* ── System Tab ─────────────────────────────────── */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">CPU Usage</span>
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold">{dashboard.system.cpu.usagePercent}%</p>
                <Progress value={dashboard.system.cpu.usagePercent} className="mt-2 h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">{dashboard.system.cpu.cores} cores</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Memory</span>
                  <HardDrive className="h-4 w-4 text-violet-500" />
                </div>
                <p className="text-2xl font-bold">{dashboard.system.memory.usagePercent}%</p>
                <Progress value={dashboard.system.memory.usagePercent} className="mt-2 h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatBytes(dashboard.system.memory.usedBytes)} / {formatBytes(dashboard.system.memory.totalBytes)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Process Memory</span>
                  <Gauge className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-2xl font-bold">{dashboard.system.process.memoryMB} MB</p>
                <p className="text-xs text-muted-foreground mt-3">Node {dashboard.system.process.nodeVersion}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Load Average</span>
                  <Activity className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold">{dashboard.system.cpu.loadAvg[0]}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  1m: {dashboard.system.cpu.loadAvg[0]} • 5m: {dashboard.system.cpu.loadAvg[1]} • 15m: {dashboard.system.cpu.loadAvg[2]}
                </p>
              </CardContent>
            </Card>
          </div>

          {cpuHistory.length > 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" /> CPU History</CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChartComponent data={cpuHistory} xKey="time" yKey="cpu" height={220} color="hsl(243, 75%, 59%)" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><HardDrive className="h-4 w-4 text-violet-500" /> Memory History</CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChartComponent data={cpuHistory} xKey="time" yKey="memory" height={220} color="hsl(280, 65%, 60%)" />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ── API Tab ────────────────────────────────────── */}
        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <span className="text-sm text-muted-foreground">Total Requests</span>
                <p className="text-2xl font-bold mt-1">{dashboard.api.totalRequests.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <span className="text-sm text-muted-foreground">Requests / min</span>
                <p className="text-2xl font-bold mt-1">{dashboard.api.requestsPerMinute}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <span className="text-sm text-muted-foreground">Avg Response Time</span>
                <p className="text-2xl font-bold mt-1">{dashboard.api.avgResponseTimeMs}ms</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <span className="text-sm text-muted-foreground">Error Rate</span>
                <p className={`text-2xl font-bold mt-1 ${dashboard.api.errorRate > 5 ? 'text-red-500' : ''}`}>{dashboard.api.errorRate}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {statusCodeData.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Status Code Distribution</CardTitle></CardHeader>
                <CardContent><PieChartComponent data={statusCodeData} height={220} /></CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Slowest Endpoints</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {dashboard.api.slowestEndpoints.map((ep, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                      <code className="text-xs bg-muted/50 px-2 py-0.5 rounded font-mono truncate max-w-[200px]">{ep.path}</code>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{ep.count} calls</span>
                        <Badge variant="outline" className={ep.avgMs > 500 ? 'text-red-500 border-red-500/30' : ''}>{ep.avgMs}ms</Badge>
                      </div>
                    </div>
                  ))}
                  {dashboard.api.slowestEndpoints.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No endpoint data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Devices Tab ────────────────────────────────── */}
        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Total', value: dashboard.devices.totalMeters, icon: MonitorSmartphone },
              { label: 'Active', value: dashboard.devices.activeMeters, icon: Wifi, color: 'text-emerald-500' },
              { label: 'Offline', value: dashboard.devices.offlineMeters, icon: WifiOff, color: 'text-red-500' },
              { label: 'Faulty', value: dashboard.devices.faultyMeters, icon: AlertTriangle, color: 'text-amber-500' },
              { label: 'Tampered', value: dashboard.devices.tamperedMeters, icon: AlertTriangle, color: 'text-red-500' },
              { label: 'Recent Rdgs', value: dashboard.devices.recentReadings, icon: BarChart3 },
              { label: 'Rdgs/min', value: dashboard.devices.readingsPerMinute, icon: Activity },
            ].map((item, i) => (
              <Card key={i}>
                <CardContent className="p-3 text-center">
                  <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color || 'text-muted-foreground'}`} />
                  <p className="text-xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {devicePieData.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Meter Status Distribution</CardTitle></CardHeader>
              <CardContent><PieChartComponent data={devicePieData} height={250} /></CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── AI Tab ──────────────────────────────────────── */}
        <TabsContent value="ai" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <span className="text-sm text-muted-foreground">AI Engine Status</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${dashboard.ai.status === 'HEALTHY' ? 'bg-emerald-500' : dashboard.ai.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                  <span className={`text-lg font-bold ${statusColor(dashboard.ai.status)}`}>{dashboard.ai.status}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <span className="text-sm text-muted-foreground">Models Loaded</span>
                <p className="text-2xl font-bold mt-1">{dashboard.ai.modelsLoaded}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <span className="text-sm text-muted-foreground">Total Predictions</span>
                <p className="text-2xl font-bold mt-1">{dashboard.ai.totalPredictions.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <span className="text-sm text-muted-foreground">Avg Inference</span>
                <p className="text-2xl font-bold mt-1">{dashboard.ai.avgInferenceTimeMs}ms</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">ML Models</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboard.ai.models.map((model, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{model.name}</p>
                        <p className="text-xs text-muted-foreground">Version: {model.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {model.accuracy && <span className="text-sm text-muted-foreground">{(model.accuracy * 100).toFixed(1)}%</span>}
                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">{model.status}</Badge>
                    </div>
                  </div>
                ))}
                {dashboard.ai.models.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">AI service unavailable</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Infrastructure Tab (MQTT + Socket.IO) ──────── */}
        <TabsContent value="infra" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" /> MQTT Broker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Connection</span>
                  <Badge className={dashboard.mqtt.connected ? 'bg-emerald-500/10 text-emerald-500 border-0' : 'bg-red-500/10 text-red-500 border-0'}>
                    {dashboard.mqtt.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Messages Received</span>
                  <span className="font-medium">{dashboard.mqtt.messagesReceived.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Messages/min</span>
                  <span className="font-medium">{dashboard.mqtt.messagesPerMinute}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Topics Subscribed</span>
                  <span className="font-medium">{dashboard.mqtt.topicsSubscribed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reconnects</span>
                  <span className={`font-medium ${dashboard.mqtt.reconnects > 5 ? 'text-amber-500' : ''}`}>{dashboard.mqtt.reconnects}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> Socket.IO Gateway
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-0">Active</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Connections</span>
                  <span className="font-medium">{dashboard.socket.totalConnections}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rooms</span>
                  <span className="font-medium">{dashboard.socket.roomCount}</span>
                </div>
                {Object.entries(dashboard.socket.namespaceCounts).map(([ns, count]) => (
                  <div key={ns} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-mono text-xs">{ns}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Network className="h-4 w-4 text-primary" /> Network Interfaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm">
                  <span className="text-muted-foreground">Hostname: </span>
                  <span className="font-medium font-mono">{dashboard.system.network.hostname}</span>
                </div>
                {dashboard.system.network.interfaces.map((iface, i) => (
                  <div key={i} className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm">
                    <span className="text-muted-foreground">{iface.name}: </span>
                    <span className="font-medium font-mono">{iface.address}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
