'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreHorizontal, FileDown, CheckCircle2, AlertTriangle, Ban } from 'lucide-react';
import type { ConsumerProfile } from '@/types';

export default function UtilityConsumersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for consumers
  const consumers = [
    { id: 'C-001', name: 'John Doe', account: 'ACC-89234', type: 'Residential', status: 'ACTIVE', flags: 0, lastReading: '10 mins ago', avgUsage: '350 kWh' },
    { id: 'C-002', name: 'Acme Corp', account: 'ACC-45192', type: 'Commercial', status: 'ACTIVE', flags: 2, lastReading: '5 mins ago', avgUsage: '4500 kWh' },
    { id: 'C-003', name: 'Jane Smith', account: 'ACC-12845', type: 'Residential', status: 'SUSPENDED', flags: 1, lastReading: '2 days ago', avgUsage: '210 kWh' },
    { id: 'C-004', name: 'Tech Solutions', account: 'ACC-99231', type: 'Commercial', status: 'ACTIVE', flags: 0, lastReading: '12 mins ago', avgUsage: '3200 kWh' },
    { id: 'C-005', name: 'Robert Johnson', account: 'ACC-55219', type: 'Residential', status: 'FLAGGED', flags: 3, lastReading: '1 hour ago', avgUsage: '850 kWh' },
    { id: 'C-006', name: 'City Hospital', account: 'ACC-11002', type: 'Industrial', status: 'ACTIVE', flags: 0, lastReading: '2 mins ago', avgUsage: '12500 kWh' },
    { id: 'C-007', name: 'Emily Davis', account: 'ACC-33491', type: 'Residential', status: 'ACTIVE', flags: 0, lastReading: '45 mins ago', avgUsage: '420 kWh' },
  ];

  const filteredConsumers = consumers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <Badge variant="success" className="bg-success/10 text-success border-0 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Active</Badge>;
      case 'FLAGGED': return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-0 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Flagged</Badge>;
      case 'SUSPENDED': return <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 flex items-center gap-1"><Ban className="h-3 w-3" /> Suspended</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consumer <span className="text-gradient">Management</span></h1>
          <p className="text-muted-foreground mt-1">View and manage consumers in your jurisdiction.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" /> Export CSV
          </Button>
          <Button>Add Consumer</Button>
        </div>
      </motion.div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Consumers</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search by name or account..." 
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
                  <th className="px-6 py-3 font-medium">Consumer</th>
                  <th className="px-6 py-3 font-medium">Account No.</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Avg Usage / Mo</th>
                  <th className="px-6 py-3 font-medium">Last Reading</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredConsumers.map((consumer) => (
                  <tr key={consumer.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{consumer.name}</span>
                        {consumer.flags > 0 && (
                           <Badge variant="destructive" className="h-4 px-1 min-w-4 flex items-center justify-center text-[9px]">
                              {consumer.flags}
                           </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{consumer.account}</td>
                    <td className="px-6 py-4">{consumer.type}</td>
                    <td className="px-6 py-4">{getStatusBadge(consumer.status)}</td>
                    <td className="px-6 py-4">{consumer.avgUsage}</td>
                    <td className="px-6 py-4 text-muted-foreground">{consumer.lastReading}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredConsumers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No consumers found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
