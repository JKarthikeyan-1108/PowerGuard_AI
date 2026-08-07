'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle, CheckCircle2, ChevronRight, Activity, ThermometerSun } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function UtilityTransformersPage() {
  const [transformers, setTransformers] = useState([
    { id: 'TR-101', name: 'Downtown Core Sub', capacity: 1000, currentLoad: 850, temp: 68, connectedMeters: 142, status: 'WARNING' },
    { id: 'TR-102', name: 'Northside Res Sub', capacity: 500, currentLoad: 210, temp: 45, connectedMeters: 85, status: 'NORMAL' },
    { id: 'TR-103', name: 'Industrial Park Alpha', capacity: 2000, currentLoad: 1950, temp: 85, connectedMeters: 12, status: 'CRITICAL' },
    { id: 'TR-104', name: 'Westend Comm Sub', capacity: 1000, currentLoad: 600, temp: 52, connectedMeters: 94, status: 'NORMAL' },
    { id: 'TR-105', name: 'Eastside Res Sub', capacity: 500, currentLoad: 480, temp: 72, connectedMeters: 110, status: 'WARNING' },
    { id: 'TR-106', name: 'Suburban Ext 1', capacity: 250, currentLoad: 110, temp: 40, connectedMeters: 45, status: 'NORMAL' },
  ]);

  // Simulate live load changes
  useEffect(() => {
    const interval = setInterval(() => {
      setTransformers(prev => prev.map(t => {
        const change = (Math.random() * 20) - 10;
        let newLoad = Math.max(0, Math.min(t.capacity, t.currentLoad + change));
        
        let newStatus = 'NORMAL';
        const percent = newLoad / t.capacity;
        if (percent > 0.9) newStatus = 'CRITICAL';
        else if (percent > 0.75) newStatus = 'WARNING';

        return { ...t, currentLoad: newLoad, status: newStatus };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CRITICAL': return 'hsl(var(--destructive))';
      case 'WARNING': return 'hsl(var(--amber-500))';
      case 'NORMAL': return 'hsl(var(--success))';
      default: return 'hsl(var(--primary))';
    }
  };

  const getStatusBg = (status: string) => {
    switch(status) {
      case 'CRITICAL': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'WARNING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'NORMAL': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transformer <span className="text-gradient">Monitoring</span></h1>
          <p className="text-muted-foreground mt-1">Live load capacity and grid health analysis.</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1"><AlertTriangle className="h-3 w-3" /> 1 Critical</Badge>
           <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1"><AlertTriangle className="h-3 w-3" /> 2 Warning</Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {transformers.map((transformer, i) => {
          const loadPercent = (transformer.currentLoad / transformer.capacity) * 100;
          const chartData = [
            { name: 'Load', value: transformer.currentLoad },
            { name: 'Remaining', value: transformer.capacity - transformer.currentLoad }
          ];
          
          return (
            <motion.div 
              key={transformer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative overflow-hidden border ${transformer.status === 'CRITICAL' ? 'border-destructive/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-border/50'}`}>
                {transformer.status === 'CRITICAL' && (
                   <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-pulse" />
                )}
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{transformer.name}</CardTitle>
                    <CardDescription className="font-mono mt-1">{transformer.id}</CardDescription>
                  </div>
                  <Badge variant="outline" className={`uppercase text-[10px] tracking-wider font-bold ${getStatusBg(transformer.status)}`}>
                    {transformer.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mt-4">
                    <div className="h-32 w-32 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            innerRadius={40}
                            outerRadius={55}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill={getStatusColor(transformer.status)} />
                            <Cell fill="hsl(var(--muted))" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold">{loadPercent.toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="flex-1 pl-6 space-y-4">
                       <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                             <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Load</span>
                             <span className="font-medium">{transformer.currentLoad.toFixed(0)} / {transformer.capacity} kW</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                             <div className="h-1.5 rounded-full transition-all duration-1000" style={{ width: `${loadPercent}%`, backgroundColor: getStatusColor(transformer.status) }} />
                          </div>
                       </div>
                       
                       <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1.5"><ThermometerSun className="h-3.5 w-3.5" /> Temp</span>
                          <span className={`font-medium ${transformer.temp > 80 ? 'text-destructive' : ''}`}>{transformer.temp}°C</span>
                       </div>

                       <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> Meters</span>
                          <span className="font-medium">{transformer.connectedMeters}</span>
                       </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/50">
                    <Button variant="ghost" className="w-full justify-between hover:bg-primary/5">
                      View Connected Meters <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
