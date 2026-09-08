import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="container py-6">
      <Skeleton className="h-7 w-48" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <Skeleton className="hidden h-96 lg:block" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
        </div>
      </div>
    </div>
  );
}
