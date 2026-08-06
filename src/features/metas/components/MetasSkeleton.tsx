"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MetasSkeleton() {
  return (
    <div className="space-y-8">
      {/* Skeletons dos 4 Cards de Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[16px] border border-border/50 bg-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-3 w-44 rounded-md" />
          </div>
        ))}
      </div>

      {/* Skeletons das Abas e Botões */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Skeletons do Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[20px] border border-border/50 bg-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>

            <div className="space-y-2 pt-2">
              <Skeleton className="h-6 w-36 rounded-md" />
              <Skeleton className="h-2.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex justify-between">
              <Skeleton className="h-8 w-32 rounded-xl" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
