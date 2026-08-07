'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChartComponent, AreaChartComponent } from '@/components/charts/Charts';
import { Calendar, Download, Filter } from 'lucide-react';

export default function UsageHistoryPage() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  // Generate mock data based on selected time range
  const generateData = () => {
    switch (timeRange) {
      case 'day':
        return Array.from({ length: 24 }).map((_, i) => ({
          label: `${i}:00`,
          usage: Number((Math.random() * 3 + 1).toFixed(2)),
          previous: Number((Math.random() * 3 + 1).toFixed(2)),
        }));
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
          label: day,
          usage: Number((Math.random() * 20 + 15).toFixed(1)),
          previous: Number((Math.random() * 20 + 15).toFixed(1)),
        }));
      case 'month':
        return Array.from({ length: 30 }).map((_, i) => ({
          label: `Day ${i + 1}`,
          usage: Number((Math.random() * 20 + 15).toFixed(1)),
          previous: Number((Math.random() * 20 + 15).toFixed(1)),
        }));
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
          label: month,
          usage: Number((Math.random() * 600 + 400).toFixed(0)),
          previous: Number((Math.random() * 600 + 400).toFixed(0)),
        }));
      default:
        return [];
    }
  };

  const chartData = generateData();

  const totalUsage = chartData.reduce((acc, curr) => acc + curr.usage, 0);
  const previousUsage = chartData.reduce((acc, curr) => acc + curr.previous, 0);
  const percentChange = ((totalUsage - previousUsage) / previousUsage) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight">Usage <span className="text-gradient">History</span></h1>
          <p className="text-muted-foreground mt-1">Analyze your past electricity consumption patterns.</p>
        </motion.div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
          {(['day', 'week', 'month', 'year'] as const).map((range) => (
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsage.toLocaleString(undefined, { maximumFractionDigits: 1 })} kWh</div>
            <p className="text-xs text-muted-foreground mt-1">
              For selected {timeRange}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{previousUsage.toLocaleString(undefined, { maximumFractionDigits: 1 })} kWh</div>
            <p className="text-xs text-muted-foreground mt-1">
              Previous {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Difference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${percentChange > 0 ? 'text-amber-500' : 'text-success'}`}>
              {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {percentChange > 0 ? 'Higher' : 'Lower'} than previous period
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Consumption Trend</CardTitle>
            <CardDescription>Current vs Previous Period (kWh)</CardDescription>
          </div>
          <div className="flex items-center gap-2 hidden sm:flex">
             <Button variant="outline" size="icon" className="h-8 w-8"><Filter className="h-4 w-4" /></Button>
             <Button variant="outline" size="sm" className="h-8 gap-2"><Download className="h-4 w-4" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <AreaChartComponent 
            data={chartData} 
            xKey="label" 
            yKey="usage" 
            yKey2="previous" 
            height={350} 
            color="hsl(243, 75%, 59%)"
            color2="hsl(220, 10%, 60%)"
          />
        </CardContent>
      </Card>
    </div>
  );
}
