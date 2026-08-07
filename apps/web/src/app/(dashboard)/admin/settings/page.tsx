'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Mail, ShieldAlert, DatabaseBackup, Globe } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System <span className="text-gradient">Settings</span></h1>
          <p className="text-muted-foreground mt-1">Configure platform-wide variables and integration keys.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* General Settings */}
         <Card className="border-border/50">
            <CardHeader>
               <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> General Configuration</CardTitle>
               <CardDescription>Basic application settings and branding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input defaultValue="PowerGuard Enterprise" />
               </div>
               <div className="space-y-2">
                  <Label>Support Email Contact</Label>
                  <Input defaultValue="support@powerguard.com" />
               </div>
               <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                     <Label>Maintenance Mode</Label>
                     <p className="text-xs text-muted-foreground">Disable non-admin logins</p>
                  </div>
                  <Switch />
               </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-4">
               <Button className="w-full gap-2"><Save className="h-4 w-4" /> Save General Settings</Button>
            </CardFooter>
         </Card>

         {/* Email / SMTP */}
         <Card className="border-border/50">
            <CardHeader>
               <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-blue-500" /> SMTP & Notifications</CardTitle>
               <CardDescription>Configure outgoing email server for alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input defaultValue="smtp.sendgrid.net" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Port</Label>
                     <Input defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                     <Label>Encryption</Label>
                     <Input defaultValue="TLS" />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" defaultValue="SG.xxxxxxxxxxxxxxxxx" />
               </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-4">
               <Button className="w-full gap-2"><Save className="h-4 w-4" /> Save SMTP Config</Button>
            </CardFooter>
         </Card>

         {/* Security */}
         <Card className="border-border/50">
            <CardHeader>
               <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-amber-500" /> Security Policies</CardTitle>
               <CardDescription>Authentication and session rules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label>Session Timeout (Minutes)</Label>
                  <Input type="number" defaultValue="60" />
               </div>
               <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                     <Label>Require 2FA for Admins</Label>
                     <p className="text-xs text-muted-foreground">Mandatory Two-Factor Authentication</p>
                  </div>
                  <Switch defaultChecked />
               </div>
               <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                     <Label>Strict IP Whitelisting</Label>
                     <p className="text-xs text-muted-foreground">Only allow admin access from corporate network</p>
                  </div>
                  <Switch />
               </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-4">
               <Button className="w-full gap-2"><Save className="h-4 w-4" /> Save Security Policies</Button>
            </CardFooter>
         </Card>

         {/* Backups */}
         <Card className="border-border/50">
            <CardHeader>
               <CardTitle className="flex items-center gap-2"><DatabaseBackup className="h-5 w-5 text-success" /> Automated Backups</CardTitle>
               <CardDescription>Database and configuration backup schedules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Input defaultValue="Daily at 02:00 UTC" />
               </div>
               <div className="space-y-2">
                  <Label>AWS S3 Bucket URI</Label>
                  <Input defaultValue="s3://powerguard-db-backups-prod" />
               </div>
               <div className="space-y-2">
                  <Label>Retention Policy (Days)</Label>
                  <Input type="number" defaultValue="30" />
               </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-4 flex gap-2">
               <Button variant="outline" className="flex-1">Test Connection</Button>
               <Button className="flex-1 gap-2"><Save className="h-4 w-4" /> Save Backup Config</Button>
            </CardFooter>
         </Card>
      </div>
    </div>
  );
}
