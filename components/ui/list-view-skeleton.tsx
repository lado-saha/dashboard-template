"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
  gridItemCount = 6,
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
          <Card key={i} className="h-[220px]">
            <CardHeader className="flex flex-row items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-20 ml-auto" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Default to list view skeleton
  return (
    <div className={cn("rounded-md border", className)}>
      <div className="divide-y">
        {Array.from({ length: listItemCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
