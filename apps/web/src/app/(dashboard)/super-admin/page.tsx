'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Users, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orgsRes, plansRes] = await Promise.all([
        api.get('/saas/organizations'),
        api.get('/saas/plans')
      ]);
      setOrganizations(orgsRes.data.data);
      setPlans(plansRes.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load SaaS data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (planId: string) => {
    const orgName = prompt("Enter Organization Name (e.g. Texas Power Board):");
    if (!orgName) return;
    
    try {
      await api.post('/saas/organizations', {
        name: orgName,
        type: 'ELECTRICITY_BOARD',
        planId: planId
      });
      toast.success('Organization created successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to create organization');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  // Calculate global metrics
  const totalMRR = organizations.reduce((acc, org) => acc + (org.plan?.priceMonthly || 0), 0);
  const totalMeters = organizations.reduce((acc, org) => acc + (org._count?.meters || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Administration (SaaS)</h1>
        <p className="text-muted-foreground mt-1">Manage global organizations, subscription plans, and tenant billing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${totalMRR.toLocaleString()}/mo</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Global Meters Under Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMeters.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mt-8">Available Subscription Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>${plan.priceMonthly}/month</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-emerald-500"/> Up to {plan.maxMeters.toLocaleString()} meters</li>
                <li className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-500"/> Up to {plan.maxUsers.toLocaleString()} users</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500"/> {JSON.parse(plan.features).length} Platform Features</li>
              </ul>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Button className="w-full" variant="outline" onClick={() => handleCreateOrg(plan.id)}>
                <Plus className="h-4 w-4 mr-2" /> Provision Tenant
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-semibold mt-8">Tenant Organizations</h2>
      <Card>
        <CardContent className="p-0">
          {organizations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No organizations provisioned yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {organizations.map(org => (
                <div key={org.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-md bg-muted">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{org.name}</h3>
                      <div className="text-xs text-muted-foreground font-mono mt-1">ID: {org.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-sm text-right hidden sm:block">
                      <div className="font-medium">{org.plan?.name}</div>
                      <div className="text-muted-foreground">${org.plan?.priceMonthly}/mo</div>
                    </div>
                    <Badge variant={org.status === 'ACTIVE' ? 'success' : 'secondary'}>{org.status}</Badge>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
