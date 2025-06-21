"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ViewMode } from "@/types/common";

interface ListViewSkeletonProps {
  viewMode: ViewMode;
  className?: string;
  gridItemCount?: number;
  listItemCount?: number;
}

export function ListViewSkeleton({
  viewMode,
  className,
  gridItemCount = 4,
  listItemCount = 5,
}: ListViewSkeletonProps) {
  if (viewMode === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
          className
        )}
      >
        {Array.from({ length: gridItemCount }).map((_, i) => (
          <Card key={i} className="h-[200px]">
            <CardHeader>
              <Skeleton className="h-5 w-3/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5 mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-6 w-16 ml-auto" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Default to list view skeleton
  return (
    <div className={cn("rounded-md border", className)}>
      <div className="p-4 border-b">
        <Skeleton className="h-6 w-1/3" />
      </div>
      <div className="divide-y">
        {Array.from({ length: listItemCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}