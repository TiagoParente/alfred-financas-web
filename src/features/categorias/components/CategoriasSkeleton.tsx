import { Skeleton } from "@/components/ui/skeleton";

export function CategoriasSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeletons dos Filtros e Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-44 rounded-[10px]" />
          <Skeleton className="h-10 w-36 rounded-[10px]" />
        </div>
      </div>

      {/* Skeletons dos Cards da Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-48 rounded-[16px]" />
        <Skeleton className="h-48 rounded-[16px]" />
        <Skeleton className="h-48 rounded-[16px]" />
        <Skeleton className="h-48 rounded-[16px]" />
        <Skeleton className="h-48 rounded-[16px]" />
        <Skeleton className="h-48 rounded-[16px]" />
      </div>
    </div>
  );
}
