'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChartComponent, PieChartComponent } from '@/components/charts/Charts';
import { Filter, Download, Activity, TrendingDown, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('year');

  const lossData = [
    { name: 'Jan', supplied: 4200, billed: 3800 },
    { name: 'Feb', supplied: 4100, billed: 3750 },
    { name: 'Mar', supplied: 4500, billed: 4050 },
    { name: 'Apr', supplied: 4800, billed: 4300 },
    { name: 'May', supplied: 5100, billed: 4600 },
    { name: 'Jun', supplied: 5400, billed: 4850 },
    { name: 'Jul', supplied: 5800, billed: 5200 },
  ];

  const lossBreakdown = [
    { name: 'Technical Losses', value: 65 },
    { name: 'Non-Technical (Theft)', value: 25 },
    { name: 'Administrative Errors', value: 10 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grid <span className="text-gradient">Analytics</span></h1>
          <p className="text-muted-foreground mt-1">High-level KPIs and aggregate grid performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
          {(['month', 'quarter', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Aggregate Grid Loss (ATC&C)" 
          value="9.8%"
          subtitle="Aggregate Technical & Commercial"
          icon={Activity}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          trend={{ value: -1.2, label: `vs last ${timeRange}` }}
        />
        <StatsCard 
          title="Collection Efficiency" 
          value="94.2%"
          subtitle="Billed vs Collected"
          icon={TrendingDown}
          iconColor="text-success"
          iconBg="bg-success/10"
          trend={{ value: 0.5, label: `vs last ${timeRange}` }}
        />
        <Card className="border-border/50">
           <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Technical Loss Ratio</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold">6.5%</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                 <ArrowUpRight className="h-3 w-3 text-destructive" /> +0.2% vs last {timeRange}
              </p>
           </CardContent>
        </Card>
        <Card className="border-border/50">
           <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Non-Technical Loss Ratio</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold">3.3%</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                 <ArrowDownRight className="h-3 w-3 text-success" /> -1.4% vs last {timeRange}
              </p>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Supplied vs Billed Energy</CardTitle>
              <CardDescription>Monthly comparison (MWh)</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" size="icon" className="h-8 w-8"><Filter className="h-4 w-4" /></Button>
               <Button variant="outline" size="sm" className="h-8 gap-2"><Download className="h-4 w-4" /> Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent 
              data={lossData} 
              xKey="name" 
              yKey="supplied" 
              height={350} 
              color="hsl(var(--primary))"
            />
            {/* Note: A proper multi-bar chart should ideally be implemented to show supplied vs billed side-by-side, 
                but we are using our shared BarChartComponent which currently supports a single yKey for simplicity in this mock. */}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Loss Breakdown</CardTitle>
            <CardDescription>Distribution of unaccounted energy</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={lossBreakdown} height={250} />
            <div className="mt-8 space-y-4">
              {lossBreakdown.map((d, i) => (
                <div key={d.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['hsl(243,75%,59%)', 'hsl(160,60%,45%)', 'hsl(30,80%,55%)'][i] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-bold">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
