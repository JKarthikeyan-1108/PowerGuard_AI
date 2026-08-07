'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <Card className="max-w-md w-full border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Failed to load dashboard data. This might be due to a network issue or server error.
          </p>
          <Button onClick={() => reset()} variant="outline">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
