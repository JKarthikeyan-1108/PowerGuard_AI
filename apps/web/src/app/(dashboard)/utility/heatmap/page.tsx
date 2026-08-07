'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ShieldAlert, Zap, AlertTriangle, Layers } from 'lucide-react';

// Dynamically import the map component with SSR disabled
const RiskMap = dynamic(() => import('@/components/charts/RiskMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground">
      Loading interactive map...
    </div>
  ),
});

export default function UtilityHeatmapPage() {
  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Risk <span className="text-gradient">Heatmap</span></h1>
          <p className="text-muted-foreground mt-1">Geospatial analysis of electricity theft and grid overloads.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2">
              <Layers className="h-4 w-4" /> Map Layers
           </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-[500px]">
        {/* Sidebar / Stats */}
        <div className="md:col-span-1 space-y-4 flex flex-col overflow-y-auto pr-2">
           <Card className="border-border/50 shrink-0">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm">Critical Zones</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-3xl font-bold text-destructive">4</div>
                 <p className="text-xs text-muted-foreground mt-1">Areas requiring immediate attention.</p>
              </CardContent>
           </Card>

           <Card className="border-border/50 flex-1">
              <CardHeader>
                 <CardTitle className="text-sm">Active Hotspots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                 <div className="divide-y divide-border/50">
                    {[
                       { name: 'Industrial Park Alpha', type: 'Theft Risk', score: '92%', status: 'CRITICAL', icon: ShieldAlert, color: 'text-destructive' },
                       { name: 'Downtown Core Sub', type: 'Overload Risk', score: '88%', status: 'HIGH', icon: Zap, color: 'text-amber-500' },
                       { name: 'Eastside Res Sub', type: 'Theft Risk', score: '85%', status: 'HIGH', icon: ShieldAlert, color: 'text-amber-500' },
                       { name: 'Northside Commercial', type: 'Overload Risk', score: '75%', status: 'MEDIUM', icon: Zap, color: 'text-blue-500' },
                    ].map((spot, i) => (
                       <div key={i} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-1">
                             <h4 className="font-semibold text-sm truncate pr-2">{spot.name}</h4>
                             <Badge variant="outline" className={`text-[10px] ${
                                spot.status === 'CRITICAL' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                                spot.status === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                             }`}>{spot.score}</Badge>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-2">
                             <spot.icon className={`h-3.5 w-3.5 ${spot.color}`} />
                             {spot.type}
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Map Container */}
        <div className="md:col-span-3 h-full min-h-[400px]">
          <Card className="h-full border-border/50 overflow-hidden relative">
             <RiskMap />
          </Card>
        </div>
      </div>
    </div>
  );
}
