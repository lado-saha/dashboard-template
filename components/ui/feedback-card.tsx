import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeedbackCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

export function FeedbackCard({
  icon: Icon,
  title,
  description,
  actionButton,
  variant = "default",
  className,
}: FeedbackCardProps) {
  return (
    <Card
      className={cn(
        "w-full",
        variant === "destructive" && "border-destructive/50 bg-destructive/10",
        className
      )}
    >
      <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted",
            variant === "destructive" && "bg-destructive/20"
          )}
        >
          <Icon
            className={cn(
              "h-8 w-8 text-muted-foreground",
              variant === "destructive" && "text-destructive"
            )}
          />
        </div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {actionButton && <div className="mt-6">{actionButton}</div>}
      </CardContent>
    </Card>
  );
}