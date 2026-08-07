'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Calendar, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const logs = [
    { id: 'LOG-9921', timestamp: '2026-08-04 10:23:45', user: 'Alice Admin', action: 'SYSTEM_SETTINGS_UPDATE', resource: '/api/config/smtp', status: 'SUCCESS', severity: 'INFO' },
    { id: 'LOG-9920', timestamp: '2026-08-04 09:15:12', user: 'SYSTEM', action: 'MODEL_RETRAIN_TRIGGER', resource: 'MODEL-LSTM-01', status: 'SUCCESS', severity: 'INFO' },
    { id: 'LOG-9919', timestamp: '2026-08-03 23:45:01', user: 'Bob Officer', action: 'CONSUMER_SUSPEND', resource: 'ACC-88123', status: 'SUCCESS', severity: 'WARNING' },
    { id: 'LOG-9918', timestamp: '2026-08-03 14:12:33', user: 'Unknown IP', action: 'FAILED_LOGIN_ATTEMPT', resource: 'AuthService', status: 'FAILURE', severity: 'CRITICAL' },
    { id: 'LOG-9917', timestamp: '2026-08-03 14:11:59', user: 'Unknown IP', action: 'FAILED_LOGIN_ATTEMPT', resource: 'AuthService', status: 'FAILURE', severity: 'CRITICAL' },
    { id: 'LOG-9916', timestamp: '2026-08-02 08:30:00', user: 'Alice Admin', action: 'USER_ROLE_UPDATE', resource: 'U-004', status: 'SUCCESS', severity: 'WARNING' },
    { id: 'LOG-9915', timestamp: '2026-08-01 16:45:22', user: 'Charlie Consumer', action: 'PASSWORD_RESET', resource: 'U-003', status: 'SUCCESS', severity: 'INFO' },
  ];

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'CRITICAL': return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case 'WARNING': return <Info className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'SUCCESS' 
      ? <Badge variant="success" className="bg-success/10 text-success border-0"><CheckCircle2 className="h-3 w-3 mr-1" /> Success</Badge>
      : <Badge variant="destructive" className="bg-destructive/10 text-destructive border-0">Failure</Badge>;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit <span className="text-gradient">Logs</span></h1>
          <p className="text-muted-foreground mt-1">Immutable record of system events, security alerts, and user actions.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" /> Date Range</Button>
           <Button className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
        </div>
      </motion.div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>System Event Ledger</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search user, action, or resource..." 
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
                  <th className="px-6 py-3 font-medium w-12"></th>
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">Actor</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Resource</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">{getSeverityIcon(log.severity)}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-6 py-4 font-semibold font-sans">{log.user}</td>
                    <td className="px-6 py-4 font-bold text-primary">{log.action}</td>
                    <td className="px-6 py-4">{log.resource}</td>
                    <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
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
