"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CartoesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton para Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl border border-border/40" />
        ))}
      </div>

      <Skeleton className="h-10 w-full rounded-2xl" />

      {/* Skeleton para Cards de Cartão de Crédito */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-2xl border border-border/40" />
        ))}
      </div>
    </div>
  );
}
