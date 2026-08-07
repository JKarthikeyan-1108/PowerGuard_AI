'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChartComponent, LineChartComponent } from '@/components/charts/Charts';
import { TrendingUp, CloudRain, Sun, Cloud, Thermometer, Wind } from 'lucide-react';

export default function DemandForecastPage() {
  const forecastData = Array.from({ length: 48 }).map((_, i) => {
    const time = new Date();
    time.setHours(time.getHours() + i);
    const label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Simulate daily curve
    const hour = time.getHours();
    const baseDemand = 1000;
    let multiplier = 1.0;
    if (hour > 8 && hour < 18) multiplier = 1.5;
    if (hour > 18 && hour < 22) multiplier = 2.2;
    if (hour < 6) multiplier = 0.6;
    
    // Add noise and trend
    const noise = Math.random() * 0.1 - 0.05;
    const predicted = baseDemand * (multiplier + noise);
    
    return {
      time: label,
      demand: Math.round(predicted),
      upperBound: Math.round(predicted * 1.1),
      lowerBound: Math.round(predicted * 0.9),
    };
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Demand <span className="text-gradient">Forecast</span></h1>
          <p className="text-muted-foreground mt-1">LSTM-powered predictive model for 48-hour grid load.</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
          Model: LSTM_v2.4 (Active)
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-3 border-border/50">
          <CardHeader className="pb-0">
            <CardTitle>48-Hour Load Prediction</CardTitle>
            <CardDescription>Predicted demand (MW) across the entire grid jurisdiction.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
             <AreaChartComponent 
               data={forecastData}
               xKey="time"
               yKey="upperBound"
               yKey2="lowerBound"
               height={400}
               color="hsl(var(--primary))"
               color2="hsl(var(--primary))"
             />
             <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/50" />
                   Confidence Interval (90%)
                </div>
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="flex-1 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm text-muted-foreground">Predicted Peak</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-4xl font-bold text-primary">2,315<span className="text-lg font-normal text-muted-foreground"> MW</span></div>
               <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[10px]">
                     <TrendingUp className="h-3 w-3" /> +12%
                  </Badge>
                  <span className="text-xs text-muted-foreground">Tomorrow, 7:00 PM</span>
               </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
                   Weather Context
                   <CloudRain className="h-4 w-4 text-blue-500" />
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-amber-500" /> Temperature
                   </div>
                   <span className="font-medium">32°C (High)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" /> Humidity
                   </div>
                   <span className="font-medium">78%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-slate-400" /> Wind Speed
                   </div>
                   <span className="font-medium">12 km/h</span>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                   <p className="text-xs text-muted-foreground leading-relaxed">
                      High humidity and temperature tomorrow evening are heavily weighting the peak load prediction due to anticipated HVAC usage.
                   </p>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
