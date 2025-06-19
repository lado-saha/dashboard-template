import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[300px] bg-muted rounded-md flex items-center justify-center overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="flex flex-col items-center text-muted-foreground z-10">
        <MapPin className="h-10 w-10 animate-bounce" />
        <p className="mt-2 text-sm font-medium">Loading Map...</p>
      </div>
      <Skeleton className="absolute inset-0 w-full h-full" />
    </div>
  );
}
