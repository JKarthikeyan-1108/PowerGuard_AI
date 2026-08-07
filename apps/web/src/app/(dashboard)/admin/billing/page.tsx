'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, FileText, Zap, Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminBillingPage() {
  const [tariffs, setTariffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTariffs();
  }, []);

  const fetchTariffs = async () => {
    try {
      const res = await api.get('/billing/tariffs');
      setTariffs(res.data.data);
    } catch (error) {
      console.error('Failed to fetch tariffs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBills = async () => {
    setGenerating(true);
    try {
      const now = new Date();
      // Simulate generating for the current month
      const res = await api.post('/billing/generate', {
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      toast.success(`Generated ${res.data.data.generated} bills successfully!`);
    } catch (error) {
      toast.error('Failed to generate bills');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Tariffs</h1>
          <p className="text-muted-foreground mt-1">Manage dynamic tariff plans and trigger billing cycles.</p>
        </div>
        <Button onClick={handleGenerateBills} disabled={generating} className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Billing Cycle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tariffs.map((tariff) => (
          <Card key={tariff.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-1">
                <Badge variant={tariff.type === 'RESIDENTIAL' ? 'default' : 'secondary'}>
                  {tariff.type}
                </Badge>
              </div>
              <CardTitle className="text-lg">{tariff.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Base Rate</span>
                  <span className="font-semibold">${tariff.baseRate.toFixed(2)}/kWh</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-orange-500/10 p-2 rounded-md">
                  <span className="text-orange-500 flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Peak Rate
                  </span>
                  <span className="font-semibold text-orange-500">${tariff.peakRate.toFixed(2)}/kWh</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-indigo-500/10 p-2 rounded-md">
                  <span className="text-indigo-400">Off-Peak Rate</span>
                  <span className="font-semibold text-indigo-400">${tariff.offPeakRate.toFixed(2)}/kWh</span>
                </div>
                <div className="pt-2 border-t border-border mt-2 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Peak Hours</span>
                  <span>{tariff.peakStartHour}:00 <ArrowRight className="inline h-3 w-3 mx-1" /> {tariff.peakEndHour}:00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
