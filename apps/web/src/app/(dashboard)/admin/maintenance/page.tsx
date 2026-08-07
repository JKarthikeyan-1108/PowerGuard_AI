'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wrench, AlertTriangle, CalendarClock, Zap, Clock, User, CheckCircle2, Loader2, Info
} from 'lucide-react';
import api from '@/lib/api';

export default function PredictiveMaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ riskiestAssets: any[]; upcomingSchedules: any[] } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/maintenance/dashboard');
      setData(res.data.data);
    } catch (error) {
      console.error('Failed to fetch maintenance data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Running AI Asset Health Assessment...</p>
        </div>
      </div>
    );
  }

  const { riskiestAssets = [], upcomingSchedules = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Predictive Maintenance</h1>
          <p className="text-muted-foreground mt-1">
            AI-driven asset health monitoring and automated maintenance scheduling.
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
          <Wrench className="h-4 w-4" />
          Run Assessment
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Riskiest Assets (Left Column) ──────────────── */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Critical Assets at Risk
              </CardTitle>
              <CardDescription>Transformers and Meters with high failure probability.</CardDescription>
            </CardHeader>
            <CardContent>
              {riskiestAssets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No assets currently at risk.</div>
              ) : (
                <div className="space-y-4">
                  {riskiestAssets.map((asset, i) => {
                    const isCritical = asset.failureProbability > 0.8;
                    return (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border-2 ${
                          isCritical ? 'border-red-500/30 bg-red-500/5' : 'border-orange-500/30 bg-orange-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                          <div className={`p-2.5 rounded-full ${isCritical ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                            <Zap className={`h-5 w-5 ${isCritical ? 'text-red-500' : 'text-orange-500'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm">
                                {asset.transformer?.name || asset.meter?.serialNumber || 'Unknown Asset'}
                              </h4>
                              <Badge variant="outline" className={isCritical ? 'text-red-500 border-red-500/30' : 'text-orange-500 border-orange-500/30'}>
                                {asset.transformer ? 'Transformer' : 'Meter'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                              <Info className="h-3 w-3" />
                              {asset.primaryRiskFactor}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-xl font-bold text-slate-200">{asset.remainingUsefulLife}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Days Left</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-xl font-bold ${isCritical ? 'text-red-400' : 'text-orange-400'}`}>
                              {(asset.failureProbability * 100).toFixed(1)}%
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Fail Prob</div>
                          </div>
                          <Button size="sm" variant={isCritical ? 'destructive' : 'secondary'} className="h-8">
                            Schedule Fix
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Upcoming Schedules (Right Column) ──────────── */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-indigo-500" />
                Upcoming Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSchedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No scheduled maintenance.</div>
              ) : (
                <div className="space-y-4">
                  {upcomingSchedules.map((schedule, i) => (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-lg border border-border bg-card/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          {schedule.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(schedule.scheduledDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <h5 className="text-sm font-semibold mb-1">
                        {schedule.transformer?.name || schedule.meter?.serialNumber || 'System Check'}
                      </h5>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {schedule.taskDescription}
                      </p>

                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {schedule.technician ? `${schedule.technician.firstName} ${schedule.technician.lastName}` : 'Unassigned'}
                        </div>
                        {!schedule.technician && (
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-indigo-400 hover:text-indigo-300">
                            Assign
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
