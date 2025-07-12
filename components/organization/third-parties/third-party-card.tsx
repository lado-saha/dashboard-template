"use client";

import React from "react";
import { ThirdPartyDto } from "@/types/organization";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Briefcase, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ThirdPartyCardProps {
  thirdParty: ThirdPartyDto;
  onEditAction: (thirdParty: ThirdPartyDto) => void;
  onDeleteAction: (thirdParty: ThirdPartyDto) => void;
}

export function ThirdPartyCard({ thirdParty, onEditAction, onDeleteAction }: ThirdPartyCardProps) {
  const name = thirdParty.name || "Unnamed Party";
  const fallback = name.charAt(0).toUpperCase();
  const statusInfo = thirdParty.is_active ? { icon: CheckCircle, color: "text-green-600", label: "Active" } : { icon: XCircle, color: "text-destructive", label: "Inactive" };

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border"><AvatarImage src={thirdParty.logo} alt={name} /><AvatarFallback className="text-lg">{fallback}</AvatarFallback></Avatar>
          <div>
            <CardTitle className="text-base font-semibold line-clamp-1">{name}</CardTitle>
            <p className="text-xs text-muted-foreground">{thirdParty.acronym}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditAction(thirdParty)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteAction(thirdParty)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Briefcase className="mr-2 h-4 w-4" />
          <span>Type: {thirdParty.type || "N/A"}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant={thirdParty.is_active ? "default" : "destructive"} className={cn("capitalize text-xs items-center font-normal", statusInfo.color)}>
          <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
          {statusInfo.label}
        </Badge>
        <Button variant="outline" size="sm" onClick={() => onEditAction(thirdParty)}>View Details</Button>
      </CardFooter>
    </Card>
  );
}
