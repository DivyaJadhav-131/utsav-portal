import { Skeleton } from '@/components/ui/skeleton';

export function EventCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3 mt-1" />
      </div>
    </div>
  );
}
