'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Play, Square, Zap, Shield, AlertTriangle, Activity, Gauge, Power,
  BarChart3, Lightbulb, Radio, MonitorSmartphone, RefreshCw, Presentation,
  Clock, TrendingUp, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';
import api from '@/lib/api';

// ── Types ────────────────────────────────────────────────

interface DemoScenarioConfig {
  name: string;
  label: string;
  description: string;
  icon: string;
  severity: string;
  category: string;
}

interface DemoState {
  enabled: boolean;
  activeScenarios: string[];
  startedAt: string | null;
  generatedReadings: number;
  generatedAlerts: number;
  speed: 'SLOW' | 'NORMAL' | 'FAST';
}

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  ELECTRICITY_THEFT: <Shield className="h-5 w-5 text-red-500" />,
  METER_TAMPERING: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  TRANSFORMER_FAILURE: <Zap className="h-5 w-5 text-yellow-500" />,
  VOLTAGE_DROP: <TrendingUp className="h-5 w-5 text-blue-500 rotate-180" />,
  CURRENT_SPIKE: <Activity className="h-5 w-5 text-red-500" />,
  HIGH_BILL: <Gauge className="h-5 w-5 text-amber-500" />,
  POWER_OUTAGE: <Power className="h-5 w-5 text-gray-500" />,
  DEMAND_FORECAST: <BarChart3 className="h-5 w-5 text-indigo-500" />,
  ENERGY_RECOMMENDATIONS: <Lightbulb className="h-5 w-5 text-emerald-500" />,
  NORMAL_OPERATION: <MonitorSmartphone className="h-5 w-5 text-emerald-500" />,
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  THEFT: { label: 'Theft Detection', color: 'text-red-500' },
  INFRASTRUCTURE: { label: 'Infrastructure', color: 'text-blue-500' },
  BILLING: { label: 'Billing', color: 'text-amber-500' },
  AI: { label: 'AI & Analytics', color: 'text-indigo-500' },
};

// ── Component ───────────────────────────────────────────

export default function DemoModePage() {
  const [scenarios, setScenarios] = useState<DemoScenarioConfig[]>([]);
  const [demoState, setDemoState] = useState<DemoState | null>(null);
  const [selectedScenarios, setSelectedScenarios] = useState<Set<string>>(new Set());
  const [speed, setSpeed] = useState<'SLOW' | 'NORMAL' | 'FAST'>('NORMAL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Fetch state and scenarios
  const fetchData = useCallback(async () => {
    try {
      const [scenarioRes, statusRes] = await Promise.all([
        api.get('/demo/scenarios'),
        api.get('/demo/status'),
      ]);
      setScenarios(scenarioRes.data.data || []);
      setDemoState(statusRes.data.data || null);
    } catch (error) {
      console.error('Failed to fetch demo data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Elapsed timer
  useEffect(() => {
    if (!demoState?.enabled || !demoState.startedAt) {
      setElapsed(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(demoState.startedAt!).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [demoState?.enabled, demoState?.startedAt]);

  // Toggle scenario selection
  const toggleScenario = (name: string) => {
    setSelectedScenarios(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Start demo
  const startDemo = async () => {
    if (selectedScenarios.size === 0) return;
    setActionLoading('start');
    try {
      await api.post('/demo/enable', {
        scenarios: Array.from(selectedScenarios),
        speed,
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to start demo:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Stop demo
  const stopDemo = async () => {
    setActionLoading('stop');
    try {
      await api.post('/demo/disable');
      await fetchData();
    } catch (error) {
      console.error('Failed to stop demo:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Run presentation sequence
  const runPresentation = async () => {
    setActionLoading('presentation');
    try {
      await api.post('/demo/presentation');
      await fetchData();
    } catch (error) {
      console.error('Presentation failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Quick scenario trigger
  const triggerScenario = async (name: string) => {
    setActionLoading(name);
    try {
      await api.post(`/demo/scenario/${name}`, { duration: 15000, speed: 'FAST' });
      await fetchData();
    } catch (error) {
      console.error(`Scenario ${name} failed:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Group scenarios by category
  const grouped = scenarios.reduce<Record<string, DemoScenarioConfig[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading demo engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Demo <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Mode</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate realistic smart meter scenarios for presentations and testing
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-violet-500/30 text-violet-500 hover:bg-violet-500/10"
          onClick={runPresentation}
          disabled={!!actionLoading}
        >
          {actionLoading === 'presentation' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Presentation className="h-4 w-4" />}
          Run Presentation
        </Button>
      </motion.div>

      {/* ── Live Status Banner ──────────────────────────── */}
      <AnimatePresence>
        {demoState?.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-primary/30 bg-primary/5 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Radio className="h-5 w-5 text-primary animate-pulse" />
                      </div>
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-ping" />
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">Demo Mode Active</h3>
                        <Badge className="bg-red-500/10 text-red-500 border-0 animate-pulse">LIVE</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {demoState.activeScenarios.length} scenario{demoState.activeScenarios.length !== 1 ? 's' : ''} running •
                        Speed: {demoState.speed} •
                        Elapsed: {formatTime(elapsed)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{demoState.generatedReadings}</p>
                      <p className="text-xs text-muted-foreground">Readings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-500">{demoState.generatedAlerts}</p>
                      <p className="text-xs text-muted-foreground">Alerts</p>
                    </div>
                    <Button variant="destructive" size="sm" className="gap-2" onClick={stopDemo} disabled={actionLoading === 'stop'}>
                      {actionLoading === 'stop' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
                      Stop
                    </Button>
                  </div>
                </div>

                {/* Active scenarios pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {demoState.activeScenarios.map(s => (
                    <Badge key={s} variant="outline" className="gap-1.5 py-1 px-2.5">
                      {SCENARIO_ICONS[s] || <Activity className="h-3 w-3" />}
                      <span className="text-xs">{s.replace(/_/g, ' ')}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Controls Bar ─────────────────────────────────── */}
      {!demoState?.enabled && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Speed:</span>
                  <div className="flex gap-1">
                    {(['SLOW', 'NORMAL', 'FAST'] as const).map(s => (
                      <Button
                        key={s}
                        variant={speed === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSpeed(s)}
                        className="text-xs px-3"
                      >
                        {s === 'SLOW' ? '🐢' : s === 'NORMAL' ? '⚡' : '🚀'} {s}
                      </Button>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({speed === 'SLOW' ? '5s' : speed === 'NORMAL' ? '2s' : '500ms'} intervals)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedScenarios.size} selected</span>
                  <Button
                    onClick={startDemo}
                    disabled={selectedScenarios.size === 0 || !!actionLoading}
                    className="gap-2"
                  >
                    {actionLoading === 'start' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Start Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Scenario Cards by Category ───────────────────── */}
      {Object.entries(grouped).map(([category, categoryScenarios], catIdx) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + catIdx * 0.05 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-sm font-semibold ${CATEGORY_LABELS[category]?.color || 'text-foreground'}`}>
              {CATEGORY_LABELS[category]?.label || category}
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryScenarios.map((scenario) => {
              const isSelected = selectedScenarios.has(scenario.name);
              const isRunning = demoState?.enabled && demoState.activeScenarios.includes(scenario.name);

              return (
                <Card
                  key={scenario.name}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isRunning
                      ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                      : isSelected
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border/50 hover:border-border'
                  }`}
                  onClick={() => !demoState?.enabled && toggleScenario(scenario.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isRunning ? 'bg-primary/10' : 'bg-muted/50'}`}>
                          {SCENARIO_ICONS[scenario.name] || <Activity className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold leading-tight">{scenario.label}</h3>
                          <Badge variant="outline" className={`text-[10px] mt-1 ${SEVERITY_COLORS[scenario.severity] || ''}`}>
                            {scenario.severity}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isRunning && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                        {!demoState?.enabled && (
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => toggleScenario(scenario.name)}
                          />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {scenario.description}
                    </p>

                    {/* Quick trigger button */}
                    {!demoState?.enabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 w-full text-xs h-7 gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerScenario(scenario.name);
                        }}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === scenario.name ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                        Quick Run (15s)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
