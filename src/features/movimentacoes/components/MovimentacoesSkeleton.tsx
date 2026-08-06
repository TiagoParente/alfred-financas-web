import { Skeleton } from "@/components/ui/skeleton";

export function MovimentacoesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton dos Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl border border-border/40 bg-card/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-32 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        ))}
      </div>

      {/* Skeleton da Barra de Filtros */}
      <div className="p-4 rounded-2xl border border-border/40 bg-card/30 flex flex-col md:flex-row gap-3 items-center justify-between">
        <Skeleton className="h-10 w-full md:w-72 rounded-xl" />
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Skeleton dos Itens da Lista */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="p-4 rounded-2xl border border-border/40 bg-card/40 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-44 rounded-md" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right space-y-1.5">
                <Skeleton className="h-5 w-24 rounded-md ml-auto" />
                <Skeleton className="h-3 w-16 rounded-md ml-auto" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
