'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreHorizontal, Plus, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function AdminMetersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const meters = [
    { id: 'MTR-99A12', firmware: 'v2.4.1', type: 'SmartMeter Pro', installDate: 'Jan 15, 2026', owner: 'ACC-55219', status: 'ONLINE', signal: -65 },
    { id: 'MTR-11B34', firmware: 'v2.4.0', type: 'SmartMeter Base', installDate: 'Feb 22, 2025', owner: 'ACC-88123', status: 'ONLINE', signal: -72 },
    { id: 'MTR-55C99', firmware: 'v1.8.9', type: 'Legacy IoT', installDate: 'Mar 10, 2023', owner: 'ACC-22941', status: 'OFFLINE', signal: 0 },
    { id: 'MTR-22D88', firmware: 'v2.4.1', type: 'SmartMeter Pro', installDate: 'Nov 05, 2025', owner: 'ACC-11044', status: 'ONLINE', signal: -58 },
    { id: 'MTR-77E41', firmware: 'v2.4.1', type: 'SmartMeter Base', installDate: 'Jun 12, 2026', owner: 'Unassigned', status: 'ONLINE', signal: -80 },
  ];

  const filteredMeters = meters.filter(m => 
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSignalStrength = (signal: number) => {
    if (signal === 0) return <span className="text-muted-foreground">-</span>;
    if (signal > -65) return <span className="text-success">Excellent ({signal} dBm)</span>;
    if (signal > -75) return <span className="text-amber-500">Good ({signal} dBm)</span>;
    return <span className="text-destructive">Poor ({signal} dBm)</span>;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meter <span className="text-gradient">Inventory</span></h1>
          <p className="text-muted-foreground mt-1">Manage smart meter hardware, firmware, and connectivity.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> OTA Update</Button>
           <Button className="gap-2"><Plus className="h-4 w-4" /> Register Meter</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <Card className="border-border/50">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-success" /> Online Meters
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-success">1,245</div>
            </CardContent>
         </Card>
         <Card className="border-border/50">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-destructive" /> Offline Meters
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-destructive">12</div>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Hardware Registry</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search meter ID or account..." 
                  className="pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Meter ID</th>
                  <th className="px-6 py-3 font-medium">Model</th>
                  <th className="px-6 py-3 font-medium">Firmware</th>
                  <th className="px-6 py-3 font-medium">Account Assignment</th>
                  <th className="px-6 py-3 font-medium">Network Status</th>
                  <th className="px-6 py-3 font-medium">Signal (MQTT)</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredMeters.map((meter) => (
                  <tr key={meter.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">{meter.id}</td>
                    <td className="px-6 py-4">{meter.type}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground text-xs">{meter.firmware}</td>
                    <td className="px-6 py-4">
                       {meter.owner === 'Unassigned' ? (
                          <span className="text-muted-foreground italic">Unassigned</span>
                       ) : (
                          <span className="font-medium">{meter.owner}</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       {meter.status === 'ONLINE' ? (
                          <Badge variant="success" className="bg-success/10 text-success border-0 gap-1"><Wifi className="h-3 w-3" /> Online</Badge>
                       ) : (
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-0 gap-1"><WifiOff className="h-3 w-3" /> Offline</Badge>
                       )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{getSignalStrength(meter.signal)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
