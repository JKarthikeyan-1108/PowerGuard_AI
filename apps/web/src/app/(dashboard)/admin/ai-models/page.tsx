'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, RotateCw, Play, Settings2, BarChart2, ShieldAlert } from 'lucide-react';
import { BarChartComponent } from '@/components/charts/Charts';

export default function AdminAIModelsPage() {
  const models = [
    { 
       id: 'MODEL-IF-01', 
       name: 'Isolation Forest', 
       purpose: 'Unsupervised Anomaly Detection',
       version: 'v2.1.0', 
       status: 'ACTIVE', 
       f1Score: 0.89, 
       lastTrained: '2026-07-28',
       icon: ShieldAlert,
       color: 'text-purple-500',
       bg: 'bg-purple-500/10'
    },
    { 
       id: 'MODEL-XGB-01', 
       name: 'XGBoost Classifier', 
       purpose: 'Supervised Theft Classification',
       version: 'v1.4.2', 
       status: 'ACTIVE', 
       f1Score: 0.94, 
       lastTrained: '2026-08-01',
       icon: BarChart2,
       color: 'text-blue-500',
       bg: 'bg-blue-500/10'
    },
    { 
       id: 'MODEL-LSTM-01', 
       name: 'LSTM Time-Series', 
       purpose: 'Demand Forecasting',
       version: 'v3.0.0', 
       status: 'TRAINING', 
       f1Score: 0.91, 
       lastTrained: 'In Progress',
       icon: RotateCw,
       color: 'text-amber-500',
       bg: 'bg-amber-500/10'
    },
  ];

  const accuracyData = [
    { name: 'Jan', value: 0.85 },
    { name: 'Feb', value: 0.86 },
    { name: 'Mar', value: 0.88 },
    { name: 'Apr', value: 0.87 },
    { name: 'May', value: 0.89 },
    { name: 'Jun', value: 0.91 },
    { name: 'Jul', value: 0.92 },
    { name: 'Aug', value: 0.94 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Models <span className="text-gradient">Configuration</span></h1>
          <p className="text-muted-foreground mt-1">Manage machine learning models for theft detection and demand forecasting.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2"><Settings2 className="h-4 w-4" /> Global ML Settings</Button>
           <Button className="gap-2"><Play className="h-4 w-4" /> Trigger Global Retraining</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {models.map((model, idx) => (
            <motion.div key={model.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
               <Card className="border-border/50 h-full flex flex-col">
                  <CardHeader className="pb-4">
                     <div className="flex justify-between items-start mb-2">
                        <div className={`p-3 rounded-xl ${model.bg}`}>
                           <model.icon className={`h-6 w-6 ${model.color} ${model.status === 'TRAINING' ? 'animate-spin' : ''}`} />
                        </div>
                        <Badge variant={model.status === 'ACTIVE' ? 'success' : 'outline'} className={model.status === 'ACTIVE' ? 'bg-success/10 text-success border-0' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}>
                           {model.status}
                        </Badge>
                     </div>
                     <CardTitle className="text-xl">{model.name}</CardTitle>
                     <CardDescription>{model.purpose}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Version</p>
                              <p className="font-mono font-medium">{model.version}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">F1 Score</p>
                              <p className="font-mono font-medium text-success">{model.f1Score}</p>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <p className="text-xs text-muted-foreground">Last Trained</p>
                           <p className="text-sm font-medium">{model.lastTrained}</p>
                        </div>
                     </div>
                     <div className="mt-6 pt-4 border-t border-border/50 flex gap-2">
                        <Button variant="outline" className="flex-1 text-xs h-8">View Logs</Button>
                        <Button variant="default" className="flex-1 text-xs h-8" disabled={model.status === 'TRAINING'}>Retrain</Button>
                     </div>
                  </CardContent>
               </Card>
            </motion.div>
         ))}
      </div>

      <Card className="border-border/50">
         <CardHeader>
            <CardTitle>Ensemble Model Accuracy (F1 Score Trend)</CardTitle>
            <CardDescription>Historical performance of the primary classification pipeline over the last 8 months.</CardDescription>
         </CardHeader>
         <CardContent>
            <div className="h-[300px] w-full">
               <BarChartComponent 
                  data={accuracyData}
                  xKey="name"
                  yKey="value"
                  color="hsl(var(--primary))"
               />
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
