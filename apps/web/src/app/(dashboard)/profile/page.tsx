'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { User, Lock, Upload } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Your <span className="text-gradient">Profile</span></h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and security.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
               <div className="relative group cursor-pointer">
                  <div className="h-24 w-24 rounded-full bg-primary/10 border-4 border-background shadow-lg flex items-center justify-center overflow-hidden">
                     {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                     ) : (
                        <User className="h-10 w-10 text-primary/50" />
                     )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Upload className="h-6 w-6 text-white" />
                  </div>
               </div>
               <h3 className="mt-4 font-bold text-lg">{user?.firstName} {user?.lastName}</h3>
               <p className="text-sm text-muted-foreground capitalize">{user?.role?.replace('_', ' ').toLowerCase() || 'Consumer'}</p>
               
               <div className="mt-6 w-full pt-6 border-t border-border/50">
                  <div className="flex justify-between text-sm mb-2">
                     <span className="text-muted-foreground">Account Status</span>
                     <span className="font-medium text-success">Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">Member Since</span>
                     <span className="font-medium">Jan 2026</span>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue={user?.firstName} />
                 </div>
                 <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue={user?.lastName} />
                 </div>
              </div>
              <div className="space-y-2">
                 <Label>Email Address</Label>
                 <Input defaultValue={user?.email} disabled />
                 <p className="text-[10px] text-muted-foreground">To change your email, please contact support.</p>
              </div>
              <div className="space-y-2">
                 <Label>Phone Number</Label>
                 <Input defaultValue={user?.phone || ''} placeholder="+1 (555) 000-0000" />
              </div>
              <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <div className="flex items-center gap-2">
                   <Lock className="h-5 w-5 text-primary" />
                   <CardTitle>Security</CardTitle>
                </div>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="space-y-2">
                   <Label>Current Password</Label>
                   <Input type="password" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                   </div>
                   <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" />
                   </div>
                </div>
                <Button variant="outline" className="mt-2">Update Password</Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
