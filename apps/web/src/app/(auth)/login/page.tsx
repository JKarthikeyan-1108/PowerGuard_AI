'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Eye, EyeOff, ArrowRight, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      
      // Get user from localStorage to determine redirect
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const roleRoute = user.role === 'SUPER_ADMIN' ? '/super-admin' : user.role === 'ADMIN' ? '/admin' : user.role === 'UTILITY_OFFICER' ? '/utility' : '/consumer';
      router.push(roleRoute);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (email: string) => {
    setEmail(email);
    setPassword('Password123');
    setIsLoading(true);
    try {
      // For demo purposes, we intercept the super admin login to inject a mock user
      if (email === 'founder@powerguard.io') {
        const superAdminMock = {
          id: 'super-1',
          email: 'founder@powerguard.io',
          firstName: 'Platform',
          lastName: 'Founder',
          role: 'SUPER_ADMIN',
          organizationId: null
        };
        localStorage.setItem('token', 'mock-super-admin-token');
        localStorage.setItem('user', JSON.stringify(superAdminMock));
        document.cookie = `token=mock-super-admin-token; path=/; max-age=86400`; // Ensure cookie is set
        toast.success('Welcome back, Platform Admin!');
        window.location.href = '/super-admin';
        return;
      }

      await login(email, 'Password123');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      router.push(user.role === 'SUPER_ADMIN' ? '/super-admin' : user.role === 'ADMIN' ? '/admin' : user.role === 'UTILITY_OFFICER' ? '/utility' : '/consumer');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      if (!window.PublicKeyCredential) {
        toast.error('Biometric authentication is not supported on this device.');
        return;
      }
      
      // Mocking the WebAuthn challenge since we don't have a full FIDO2 backend
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          timeout: 60000,
          userVerification: 'preferred',
        }
      });
      
      toast.success('Biometric verification successful!');
      
      // Mock logging in as Consumer for the PWA demo
      await quickLogin('alice.anderson@email.com');
      
    } catch (err) {
      console.error(err);
      toast.error('Biometric authentication failed or was cancelled.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-electric-600 to-electric-500">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold">PowerGuard</span>
      </div>

      <Card className="border-0 shadow-none lg:border lg:shadow-sm bg-transparent lg:bg-card">
        <CardHeader className="space-y-1 px-0 lg:px-6">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access the platform</CardDescription>
        </CardHeader>
        <CardContent className="px-0 lg:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" variant="premium" size="lg" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4 ml-2" /></>
              )}
            </Button>
            
            <Button 
              type="button" 
              className="w-full gap-2 mt-2" 
              variant="outline" 
              size="lg" 
              onClick={handleBiometricLogin}
              disabled={isLoading}
            >
              <Fingerprint className="h-5 w-5" />
              Sign in with Biometrics
            </Button>
          </form>

          {/* Quick login buttons (dev only) */}
          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Quick Login (Demo)</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={() => quickLogin('founder@powerguard.io')} disabled={isLoading} className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                Super Admin
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickLogin('admin@powerguard.io')} disabled={isLoading}>
                Org Admin
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => quickLogin('james.wilson@powerguard.io')} disabled={isLoading}>
                Utility
              </Button>
              <Button variant="outline" size="sm" onClick={() => quickLogin('alice.anderson@email.com')} disabled={isLoading}>
                Consumer
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-0 lg:px-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
