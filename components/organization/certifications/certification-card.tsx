"use client";

import React from "react";
import { CertificationDto } from "@/types/organization";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  Award,
  CalendarCheck2,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";

interface CertificationCardProps {
  item: CertificationDto;
  onEditAction: (item: CertificationDto) => void;
  onDeleteAction: (item: CertificationDto) => void;
  className?: string;
}

export function CertificationCard({
  item,
  onEditAction,
  onDeleteAction,
  className,
}: CertificationCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow duration-200 ease-in-out group",
        className
      )}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base sm:text-md font-semibold leading-tight line-clamp-2 flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary opacity-80 flex-shrink-0" />
            <span className="truncate" title={item.name}>
              {item.name || "Untitled Certification"}
            </span>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 opacity-70 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEditAction(item)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteAction(item)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-xs pt-1 truncate">
          Type: {item.type || "N/A"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-1.5 text-sm py-2">
        <p className="text-foreground whitespace-pre-wrap break-words line-clamp-3 min-h-[4.5em]">
          {item.description || (
            <span className="italic text-muted-foreground">
              No description provided.
            </span>
          )}
        </p>
      </CardContent>
      <CardFooter className="pt-2 pb-3 text-xs text-muted-foreground justify-end flex items-center gap-1.5">
        <CalendarCheck2 className="h-3 w-3" />
        Obtained:{" "}
        {item.obtainment_date && isValid(parseISO(item.obtainment_date))
          ? format(parseISO(item.obtainment_date), "PP")
          : "-"}
      </CardFooter>
    </Card>
  );
}
