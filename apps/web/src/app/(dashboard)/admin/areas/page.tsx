'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, MoreHorizontal, Plus, Users, Zap } from 'lucide-react';

export default function AdminAreasPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const areas = [
    { id: 'REG-N01', name: 'Downtown Core', region: 'North District', consumers: 12450, transformers: 14, manager: 'Alice Admin', status: 'ACTIVE' },
    { id: 'REG-N02', name: 'Suburban West', region: 'North District', consumers: 8200, transformers: 8, manager: 'Dave Inspector', status: 'ACTIVE' },
    { id: 'REG-S01', name: 'Industrial Park Alpha', region: 'South District', consumers: 350, transformers: 22, manager: 'Bob Officer', status: 'ACTIVE' },
    { id: 'REG-E01', name: 'Eastside Residential', region: 'East District', consumers: 15600, transformers: 18, manager: 'Alice Admin', status: 'ACTIVE' },
    { id: 'REG-W01', name: 'Tech Hub Park', region: 'West District', consumers: 4100, transformers: 12, manager: 'Unassigned', status: 'PENDING' },
  ];

  const filteredAreas = areas.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Area <span className="text-gradient">Management</span></h1>
          <p className="text-muted-foreground mt-1">Configure geographical zones and assign managers.</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Area</Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Jurisdictions & Zones</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search area name or region..." 
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Area Code</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Region</th>
                  <th className="px-6 py-3 font-medium">Consumers</th>
                  <th className="px-6 py-3 font-medium">Transformers</th>
                  <th className="px-6 py-3 font-medium">Area Manager</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">{area.id}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{area.name}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">{area.region}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {area.consumers.toLocaleString()}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          {area.transformers}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       {area.manager === 'Unassigned' ? (
                          <span className="text-muted-foreground italic text-xs">Unassigned</span>
                       ) : (
                          <span className="text-sm">{area.manager}</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant={area.status === 'ACTIVE' ? 'success' : 'secondary'} className={area.status === 'ACTIVE' ? 'bg-success/10 text-success border-0' : ''}>
                          {area.status}
                       </Badge>
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
