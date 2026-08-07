'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreHorizontal, Plus, Zap, AlertTriangle, Settings2, Wrench } from 'lucide-react';

export default function AdminTransformersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const transformers = [
    { id: 'TR-101', name: 'Downtown Core Sub', model: 'Siemens HV-500', installDate: '2018-05-12', capacity: '1000 kW', status: 'ACTIVE', nextMaintenance: '2026-09-15' },
    { id: 'TR-102', name: 'Northside Res Sub', model: 'ABB EcoFit 250', installDate: '2021-11-20', capacity: '500 kW', status: 'ACTIVE', nextMaintenance: '2027-01-10' },
    { id: 'TR-103', name: 'Industrial Park Alpha', model: 'GE ProLine 2000', installDate: '2015-02-28', capacity: '2000 kW', status: 'NEEDS_MAINTENANCE', nextMaintenance: 'OVERDUE' },
    { id: 'TR-104', name: 'Westend Comm Sub', model: 'Siemens HV-1000', installDate: '2019-08-05', capacity: '1000 kW', status: 'ACTIVE', nextMaintenance: '2026-12-01' },
    { id: 'TR-105', name: 'Eastside Res Sub', model: 'ABB EcoFit 250', installDate: '2022-03-15', capacity: '500 kW', status: 'ACTIVE', nextMaintenance: '2027-03-15' },
    { id: 'TR-106', name: 'Suburban Ext 1', model: 'Schneider Altivar', installDate: '2025-01-10', capacity: '250 kW', status: 'ACTIVE', nextMaintenance: '2028-01-10' },
    { id: 'TR-107', name: 'South District Main', model: 'GE ProLine 2000', installDate: '2012-10-30', capacity: '2000 kW', status: 'DECOMMISSIONED', nextMaintenance: 'N/A' },
  ];

  const filteredTransformers = transformers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transformer <span className="text-gradient">Hardware</span></h1>
          <p className="text-muted-foreground mt-1">Manage grid infrastructure inventory and maintenance schedules.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2"><Settings2 className="h-4 w-4" /> Config Templates</Button>
           <Button className="gap-2"><Plus className="h-4 w-4" /> Add Hardware</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <Card className="border-border/50">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-success" /> Active Transformers
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">142</div>
            </CardContent>
         </Card>
         <Card className="border-border/50 bg-amber-500/5 border-amber-500/20">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-amber-500 flex items-center gap-2">
                  <Wrench className="h-4 w-4" /> Maintenance Due
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-amber-500">8</div>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Hardware Inventory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search ID or location..." 
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
                  <th className="px-6 py-3 font-medium">Hardware ID</th>
                  <th className="px-6 py-3 font-medium">Location Name</th>
                  <th className="px-6 py-3 font-medium">Model</th>
                  <th className="px-6 py-3 font-medium">Capacity</th>
                  <th className="px-6 py-3 font-medium">Install Date</th>
                  <th className="px-6 py-3 font-medium">Next Maintenance</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredTransformers.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">{t.id}</td>
                    <td className="px-6 py-4 font-semibold">{t.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{t.model}</td>
                    <td className="px-6 py-4">{t.capacity}</td>
                    <td className="px-6 py-4 text-muted-foreground">{t.installDate}</td>
                    <td className="px-6 py-4">
                       {t.nextMaintenance === 'OVERDUE' ? (
                          <span className="text-destructive font-bold flex items-center gap-1">
                             <AlertTriangle className="h-3.5 w-3.5" /> OVERDUE
                          </span>
                       ) : (
                          <span className="text-muted-foreground">{t.nextMaintenance}</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       {t.status === 'ACTIVE' && <Badge variant="success" className="bg-success/10 text-success border-0">ACTIVE</Badge>}
                       {t.status === 'NEEDS_MAINTENANCE' && <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">MAINTENANCE</Badge>}
                       {t.status === 'DECOMMISSIONED' && <Badge variant="secondary">DECOMMISSIONED</Badge>}
                    </td>
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
