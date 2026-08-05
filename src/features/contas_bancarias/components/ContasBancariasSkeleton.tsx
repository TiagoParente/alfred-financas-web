import { Skeleton } from "@/components/ui/skeleton";

export function ContasBancariasSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeletons dos Cards de Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-[16px]" />
        <Skeleton className="h-32 rounded-[16px]" />
        <Skeleton className="h-32 rounded-[16px]" />
      </div>

      {/* Skeleton Header da Lista */}
      <div className="flex items-center justify-between pt-4">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-[10px]" />
      </div>

      {/* Skeletons dos Cards da Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-44 rounded-[16px]" />
        <Skeleton className="h-44 rounded-[16px]" />
        <Skeleton className="h-44 rounded-[16px]" />
      </div>
    </div>
  );
}
