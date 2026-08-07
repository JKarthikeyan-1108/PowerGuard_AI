'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Zap, Bell, Shield, Smartphone, Mail, Settings2 } from 'lucide-react';

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Account <span className="text-gradient">Settings</span></h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and linked devices.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>Choose how you want to be notified about alerts and bills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive daily summaries and bills via email.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${emailAlerts ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get critical alerts (like outages) via SMS.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${smsAlerts ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${smsAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive in-app alerts and recommendations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPushAlerts(!pushAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${pushAlerts ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pushAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive offers for smart home devices.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMarketing(!marketing)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${marketing ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${marketing ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Tariff Plan</CardTitle>
              </div>
              <CardDescription>Your current energy pricing structure.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border border-border/50 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-lg">Standard Flat Rate</h4>
                  <p className="text-sm text-muted-foreground mt-1">You are currently on a fixed rate of $0.12/kWh.</p>
                </div>
                <Button variant="outline" className="shrink-0 bg-background">Change Plan</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle>Linked Meters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-border/50 rounded-lg">
                 <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Primary Residence</span>
                    <span className="flex h-2 w-2 rounded-full bg-success"></span>
                 </div>
                 <p className="text-xs text-muted-foreground font-mono">MTR-9A4F2B</p>
                 <p className="text-xs text-muted-foreground mt-2">Added: Jan 15, 2026</p>
              </div>
              
              <Button variant="outline" className="w-full border-dashed">
                 + Add Smart Meter
              </Button>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <div className="flex items-center gap-2">
                   <Shield className="h-5 w-5 text-primary" />
                   <CardTitle>Data Privacy</CardTitle>
                </div>
             </CardHeader>
             <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">Manage how your data is used for AI recommendations.</p>
                <Button variant="link" className="p-0 h-auto text-primary">View Privacy Policy</Button>
                <Button variant="destructive" className="w-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-0">
                   Request Data Deletion
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
