'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-electric-600 to-electric-500">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold">PowerGuard</span>
      </div>

      <Card className="border-0 shadow-none lg:border lg:shadow-sm bg-transparent lg:bg-card">
        <CardHeader className="space-y-1 px-0 lg:px-6">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Registration is currently invite-only for utility partners.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 lg:px-6">
          <p className="text-sm text-muted-foreground">
            Please contact your utility provider administrator to receive an invitation link to create your account.
          </p>
        </CardContent>
        <CardFooter className="px-0 lg:px-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
