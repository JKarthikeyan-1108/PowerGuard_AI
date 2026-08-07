import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 w-full max-w-md px-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
