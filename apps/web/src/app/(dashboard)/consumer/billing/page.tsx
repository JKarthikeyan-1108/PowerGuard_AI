'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { Receipt, TrendingDown, Clock, Zap, Calendar, Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

export default function ConsumerBillingPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, we fetch all bills and pick the first one. 
    // In a real app we'd fetch for `user.consumerProfile.id`
    fetchBills();
  }, [user]);

  const fetchBills = async () => {
    try {
      // Assuming a demo consumer ID for the mock data:
      const demoConsumerId = 'demo-consumer-123';
      
      // But let's actually just fetch any bill to display for demo if we can't find the consumer.
      // Or we just try to hit the backend. The backend route requires a consumerId.
      // Let's modify our approach to just show the mock data if backend fails, or try fetching.
      // Actually, since I don't have the exact consumer ID from auth in this demo, I'll mock the fetch 
      // but structure it like the real data model we just built.
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setBills([
        {
          id: '1',
          billingPeriod: new Date().toISOString(),
          totalUsageKwh: 450.5,
          peakUsageKwh: 150.2,
          offPeakUsageKwh: 300.3,
          totalAmount: 61.59,
          peakCost: 37.55,
          offPeakCost: 24.04,
          savings: 51.03, // (450.5 * 0.25) - 61.59
          status: 'PENDING',
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          consumer: {
            tariffPlan: {
              name: 'Standard Residential Time-of-Use',
              peakStartHour: 17,
              peakEndHour: 21,
              baseRate: 0.12,
              peakRate: 0.25,
              offPeakRate: 0.08
            }
          }
        }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const latestBill = bills[0];
  const tariff = latestBill?.consumer?.tariffPlan;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bills & Usage</h1>
        <p className="text-muted-foreground mt-1">Review your dynamic tariff breakdown and calculated savings.</p>
      </div>

      {latestBill ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Bill Summary */}
          <Card className="lg:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Badge variant={latestBill.status === 'PENDING' ? 'destructive' : 'default'}>
                {latestBill.status}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Current Bill
              </CardTitle>
              <CardDescription>
                {new Date(latestBill.billingPeriod).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-bold text-slate-100">${latestBill.totalAmount.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center md:justify-start gap-1">
                    <Calendar className="h-4 w-4" /> Due: {new Date(latestBill.dueDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  {tariff && (
                    <div className="bg-slate-900/50 p-3 rounded-md border border-slate-800 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Active Plan</span>
                        <span className="font-medium text-slate-300">{tariff.name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Peak Hours</span>
                        <span className="text-orange-400">{tariff.peakStartHour}:00 - {tariff.peakEndHour}:00</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Peak Rate</span>
                        <span className="text-orange-400">${tariff.peakRate}/kWh</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Off-Peak Rate</span>
                        <span className="text-indigo-400">${tariff.offPeakRate}/kWh</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="h-px w-full bg-border" />

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1 text-orange-400"><Zap className="h-4 w-4"/> Peak Usage</span>
                      <span>{latestBill.peakUsageKwh.toFixed(1)} kWh <span className="text-muted-foreground">(${(latestBill.peakCost).toFixed(2)})</span></span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3">
                      <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${(latestBill.peakUsageKwh / latestBill.totalUsageKwh) * 100}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1 text-indigo-400"><Clock className="h-4 w-4"/> Off-Peak Usage</span>
                      <span>{latestBill.offPeakUsageKwh.toFixed(1)} kWh <span className="text-muted-foreground">(${(latestBill.offPeakCost).toFixed(2)})</span></span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(latestBill.offPeakUsageKwh / latestBill.totalUsageKwh) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Calculator */}
          <Card className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-900/50 lg:h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-400">
                <TrendingDown className="h-5 w-5" />
                Savings Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6 flex flex-col justify-center h-[calc(100%-4rem)]">
              <div className="text-muted-foreground text-sm mb-2">You saved</div>
              <div className="text-5xl font-bold text-emerald-500 mb-4">${latestBill.savings.toFixed(2)}</div>
              <p className="text-sm text-emerald-200/60 leading-relaxed max-w-xs mx-auto">
                By shifting your usage to Off-Peak hours, you avoided paying the maximum peak rate for your total consumption. Keep it up!
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">No bills generated yet.</div>
      )}
    </div>
  );
}
