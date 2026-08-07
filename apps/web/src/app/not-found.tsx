import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-600 to-electric-500 shadow-lg shadow-electric-500/25 mb-6">
        <Zap className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-6xl font-bold tracking-tight text-foreground">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">Page not found</p>
      <p className="mt-1 text-sm text-muted-foreground/70">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Return Home
      </Link>
    </div>
  );
}
