'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, AlertTriangle, Info, ShieldAlert, Search, Filter } from 'lucide-react';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const alerts = [
    {
      id: 'ALT-1049',
      title: 'Grid Voltage Fluctuation',
      description: 'Voltage dropped below 210V for 3 seconds. The issue has now stabilized.',
      severity: 'HIGH' as Severity,
      timestamp: 'Today, 10:42 AM',
      read: false,
    },
    {
      id: 'ALT-1048',
      title: 'High Usage Warning',
      description: 'You are consuming 25% more power than your historical average for this time of day.',
      severity: 'MEDIUM' as Severity,
      timestamp: 'Yesterday, 6:15 PM',
      read: false,
    },
    {
      id: 'ALT-1047',
      title: 'Payment Reminder',
      description: 'Your upcoming invoice is due in 5 days. Ensure AutoPay is funded.',
      severity: 'LOW' as Severity,
      timestamp: 'Aug 1, 2026, 09:00 AM',
      read: true,
    },
    {
      id: 'ALT-1046',
      title: 'Tamper Attempt Detected',
      description: 'Physical meter cover removal detected. Utility officers have been dispatched.',
      severity: 'CRITICAL' as Severity,
      timestamp: 'Jul 28, 2026, 02:33 AM',
      read: true,
    }
  ];

  const filteredAlerts = alerts.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const getSeverityConfig = (severity: Severity) => {
    switch(severity) {
      case 'CRITICAL': return { icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10' };
      case 'HIGH': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'MEDIUM': return { icon: Bell, color: 'text-energy-500', bg: 'bg-energy-500/10' };
      case 'LOW': return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System <span className="text-gradient">Alerts</span></h1>
          <p className="text-muted-foreground mt-1">Notifications and warnings regarding your power usage.</p>
        </div>
        <Button variant="outline" className="shrink-0 gap-2">
           <Bell className="h-4 w-4" /> Mark all as read
        </Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-4">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Recent Notifications</CardTitle>
              <div className="flex items-center gap-2">
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                       type="text" 
                       placeholder="Search alerts..." 
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
           <div className="divide-y divide-border/50">
             {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => {
               const config = getSeverityConfig(alert.severity);
               return (
                 <div key={alert.id} className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 hover:bg-muted/30 transition-colors ${!alert.read ? 'bg-primary/5' : ''}`}>
                    <div className={`p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0 ${config.bg}`}>
                       <config.icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <span className="text-xs text-muted-foreground font-mono">{alert.timestamp}</span>
                       </div>
                       <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                       <div className="flex items-center gap-3 mt-3">
                          <Badge variant="outline" className="text-[10px] tracking-wider font-medium uppercase bg-background">
                             {alert.severity}
                          </Badge>
                          {!alert.read && <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 border-0 text-[10px] tracking-wider uppercase">New</Badge>}
                       </div>
                    </div>
                 </div>
               );
             }) : (
               <div className="p-12 text-center text-muted-foreground">
                 No alerts found matching your search.
               </div>
             )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
