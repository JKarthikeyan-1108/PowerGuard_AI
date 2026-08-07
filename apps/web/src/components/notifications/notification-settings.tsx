'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
  });

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/notifications/preferences`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setPrefs({
          emailEnabled: json.data.emailEnabled,
          pushEnabled: json.data.pushEnabled,
          inAppEnabled: json.data.inAppEnabled,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const savePrefs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/notifications/preferences`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prefs)
      });
      if (res.ok) {
        toast.success('Notification preferences updated');
      }
    } catch (e) {
      toast.error('Failed to update preferences');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive alerts and incident updates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="email-enabled" className="flex flex-col space-y-1">
            <span>Email Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">Receive daily digests and critical alerts via email.</span>
          </Label>
          <Switch id="email-enabled" checked={prefs.emailEnabled} onCheckedChange={(c) => setPrefs(prev => ({...prev, emailEnabled: c}))} />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="push-enabled" className="flex flex-col space-y-1">
            <span>Push Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">Receive browser push notifications even when closed.</span>
          </Label>
          <Switch id="push-enabled" checked={prefs.pushEnabled} onCheckedChange={(c) => setPrefs(prev => ({...prev, pushEnabled: c}))} />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="inapp-enabled" className="flex flex-col space-y-1">
            <span>In-App Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">Live badge counter and feed updates.</span>
          </Label>
          <Switch id="inapp-enabled" checked={prefs.inAppEnabled} onCheckedChange={(c) => setPrefs(prev => ({...prev, inAppEnabled: c}))} />
        </div>
        
        <Button onClick={savePrefs} className="w-full">Save Preferences</Button>
      </CardContent>
    </Card>
  );
}
