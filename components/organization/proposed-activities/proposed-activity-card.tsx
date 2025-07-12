"use client";

import React from "react";
import { ProposedActivityDto } from "@/types/organization";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Activity, DollarSign } from "lucide-react";

interface ProposedActivityCardProps {
  activity: ProposedActivityDto;
  onEditAction: (activity: ProposedActivityDto) => void;
  onDeleteAction: (activity: ProposedActivityDto) => void;
}

export function ProposedActivityCard({ activity, onEditAction, onDeleteAction }: ProposedActivityCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border">
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold line-clamp-1">{activity.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{activity.type}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditAction(activity)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteAction(activity)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground">
        <p className="line-clamp-2">{activity.description || "No description provided."}</p>
      </CardContent>
      <CardFooter className="flex justify-end items-center">
        <div className="font-semibold text-lg flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
          {activity.rate?.toFixed(2) || "N/A"}
        </div>
      </CardFooter>
    </Card>
  );
}
