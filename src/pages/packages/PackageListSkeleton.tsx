import { Skeleton } from '@/components/ui/skeleton';

function PackageCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3.5 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            </div>

            {/* Badges row */}
            <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Divider */}
            <Skeleton className="h-px w-full" />

            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
        </div>
    );
}

interface PackageListSkeletonProps {
    count?: number;
}

export function PackageListSkeleton({ count = 4 }: PackageListSkeletonProps) {
    return (
        <div className="space-y-4">
            {/* Search bar skeleton */}
            <Skeleton className="h-11 w-full rounded-xl" />

            {/* Cards grid */}
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: count }).map((_, i) => (
                    <PackageCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
