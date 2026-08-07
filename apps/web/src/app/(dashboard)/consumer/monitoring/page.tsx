'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChartComponent } from '@/components/charts/Charts';
import { Activity, Zap, Server, ShieldCheck } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';

export default function LiveMonitoringPage() {
  const [data, setData] = useState<{ time: string; consumption: number; average: number }[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    voltage: 230,
    current: 12.5,
    powerFactor: 0.98,
    frequency: 50.1,
  });

  // Simulate real-time data
  useEffect(() => {
    // Initial data load (last 60 seconds)
    const initialData = Array.from({ length: 60 }).map((_, i) => {
      const d = new Date();
      d.setSeconds(d.getSeconds() - (60 - i));
      return {
        time: d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        consumption: Number((Math.random() * 2 + 1.5).toFixed(2)),
        average: 2.0,
      };
    });
    setData(initialData);

    const interval = setInterval(() => {
      const now = new Date();
      
      // Update charts
      setData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          consumption: Number((Math.random() * 2 + 1.5).toFixed(2)),
          average: 2.0,
        });
        return newData;
      });

      // Update gauges/metrics slightly
      setCurrentMetrics(prev => ({
        voltage: Number((230 + (Math.random() * 2 - 1)).toFixed(1)),
        current: Number((12.5 + (Math.random() * 1 - 0.5)).toFixed(2)),
        powerFactor: Number((0.98 + (Math.random() * 0.02 - 0.01)).toFixed(3)),
        frequency: Number((50.1 + (Math.random() * 0.2 - 0.1)).toFixed(2)),
      }));

    }, 2000); // Every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live <span className="text-gradient-premium">Monitoring</span></h1>
          <p className="text-muted-foreground mt-1">Real-time electricity consumption and grid health.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 px-3 py-1">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Connected
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 font-mono text-xs text-muted-foreground">
            MTR-9A4F2B
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard 
          title="Current Draw" 
          value={`${currentMetrics.current} A`}
          subtitle="Real-time Amperage"
          icon={Activity}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <StatsCard 
          title="Voltage" 
          value={`${currentMetrics.voltage} V`}
          subtitle="Grid Voltage"
          icon={Zap}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          delay={1}
        />
        <StatsCard 
          title="Power Factor" 
          value={currentMetrics.powerFactor}
          subtitle="Efficiency"
          icon={ShieldCheck}
          iconColor={currentMetrics.powerFactor > 0.95 ? 'text-green-500' : 'text-amber-500'}
          iconBg={currentMetrics.powerFactor > 0.95 ? 'bg-green-500/10' : 'bg-amber-500/10'}
          delay={2}
        />
        <StatsCard 
          title="Frequency" 
          value={`${currentMetrics.frequency} Hz`}
          subtitle="Grid Frequency"
          icon={Server}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
          delay={3}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <div>
              <CardTitle className="text-base font-semibold">Live Power Consumption (kW)</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Updating every 2 seconds</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4 relative z-10">
            {data.length > 0 ? (
              <AreaChartComponent 
                data={data} 
                xKey="time" 
                yKey="consumption" 
                yKey2="average" 
                height={350} 
                color="hsl(243, 75%, 59%)"
                color2="hsl(243, 20%, 40%)"
                showGrid={true}
              />
            ) : (
              <div className="h-[350px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* System Events */}
         <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Latest System Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: '10:42:15 AM', event: 'Power factor stabilized', type: 'info' },
                { time: '10:30:00 AM', event: 'Slight voltage dip detected', type: 'warning' },
                { time: '09:15:22 AM', event: 'Meter heartbeat sync successful', type: 'success' },
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'success' ? 'bg-green-500' : 
                      log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-muted-foreground font-medium">{log.event}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Device Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
             <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="font-medium">PowerGuard Smart X1</span>
             </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Firmware Version</span>
                <span className="font-medium">v2.4.1-stable</span>
             </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">MAC Address</span>
                <span className="font-mono">00:1A:2B:3C:4D:5E</span>
             </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Network Latency</span>
                <span className="font-medium text-success">14ms</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
