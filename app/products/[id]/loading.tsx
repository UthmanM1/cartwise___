import { Skeleton } from '@/components/ui/skeleton';

export default function ProductLoading() {
  return (
    <div className="container py-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
