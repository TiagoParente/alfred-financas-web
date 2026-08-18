"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProjecaoSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* 4 KPIs Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-24 rounded-sm" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-36 rounded-md" />
              <Skeleton className="h-3 w-48 rounded-sm" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alfred Insights Skeleton */}
      <Skeleton className="h-36 w-full rounded-2xl" />

      {/* Main Chart Skeleton */}
      <Card className="rounded-2xl border-border bg-card">
        <CardHeader className="p-5 pb-2">
          <Skeleton className="h-5 w-64 rounded-md" />
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </CardContent>
      </Card>

      {/* Credit Card Invoices Projection Skeleton */}
      <Skeleton className="h-[340px] w-full rounded-2xl" />

      {/* Category Distribution Skeleton */}
      <Skeleton className="h-[280px] w-full rounded-2xl" />

      {/* Category Matrix Table Skeleton */}
      <Skeleton className="h-[380px] w-full rounded-2xl" />
    </div>
  );
}
