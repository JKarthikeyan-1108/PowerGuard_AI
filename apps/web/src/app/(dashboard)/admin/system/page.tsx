'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Server, Database, Activity, Cpu, HardDrive, Network, RefreshCw } from 'lucide-react';
import { AreaChartComponent } from '@/components/charts/Charts';

export default function AdminSystemHealthPage() {
  const [cpuData, setCpuData] = useState<{ time: string; value: number }[]>([]);
  const [memData, setMemData] = useState<{ time: string; value: number }[]>([]);
  
  useEffect(() => {
    // Generate initial dummy data
    const now = new Date();
    const cData = [];
    const mData = [];
    for (let i = 20; i >= 0; i--) {
       const t = new Date(now.getTime() - i * 5000);
       const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
       cData.push({ time: timeStr, value: 30 + Math.random() * 20 });
       mData.push({ time: timeStr, value: 45 + Math.random() * 5 });
    }
    setCpuData(cData);
    setMemData(mData);

    const interval = setInterval(() => {
       const t = new Date();
       const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
       
       setCpuData(prev => [...prev.slice(1), { time: timeStr, value: 30 + Math.random() * 25 }]);
       setMemData(prev => [...prev.slice(1), { time: timeStr, value: 45 + Math.random() * 8 }]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const services = [
    { name: 'Node.js API Server', status: 'HEALTHY', uptime: '14d 02h 45m', latency: '45ms', icon: Server, color: 'text-success', bg: 'bg-success/10' },
    { name: 'FastAPI AI Engine', status: 'HEALTHY', uptime: '7d 12h 10m', latency: '120ms', icon: Activity, color: 'text-success', bg: 'bg-success/10' },
    { name: 'MySQL Database', status: 'HEALTHY', uptime: '30d 05h 22m', latency: '15ms', icon: Database, color: 'text-success', bg: 'bg-success/10' },
    { name: 'MQTT Broker (HiveMQ)', status: 'WARNING', uptime: '2d 11h 05m', latency: '350ms', icon: Network, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System <span className="text-gradient">Health</span></h1>
          <p className="text-muted-foreground mt-1">Real-time monitoring of microservices and infrastructure.</p>
        </div>
        <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Restart Services</Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {services.map((service, idx) => (
            <motion.div key={service.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
               <Card className="border-border/50 h-full">
                  <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${service.bg}`}>
                           <service.icon className={`h-5 w-5 ${service.color}`} />
                        </div>
                        <Badge variant={service.status === 'HEALTHY' ? 'success' : 'outline'} className={service.status === 'HEALTHY' ? 'bg-success/10 text-success border-0' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}>
                           {service.status}
                        </Badge>
                     </div>
                     <h3 className="font-semibold mb-1">{service.name}</h3>
                     <div className="flex justify-between items-center text-sm mt-4">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{service.uptime}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-muted-foreground">Latency</span>
                        <span className="font-medium">{service.latency}</span>
                     </div>
                  </CardContent>
               </Card>
            </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <Card className="border-border/50">
            <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg">
                  <Cpu className="h-5 w-5 text-primary" /> Global CPU Usage
               </CardTitle>
               <CardDescription>Aggregated CPU load across all nodes</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="h-[250px] w-full">
                  <AreaChartComponent 
                     data={cpuData}
                     xKey="time"
                     yKey="value"
                     color="hsl(var(--primary))"
                  />
               </div>
            </CardContent>
         </Card>

         <Card className="border-border/50">
            <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg">
                  <HardDrive className="h-5 w-5 text-energy-500" /> Global Memory Usage
               </CardTitle>
               <CardDescription>Aggregated RAM utilization across all nodes</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="h-[250px] w-full">
                  <AreaChartComponent 
                     data={memData}
                     xKey="time"
                     yKey="value"
                     color="hsl(var(--energy-500))"
                  />
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
