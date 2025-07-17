"use client";

import React from "react";
import { BusinessDomainDto } from "@/types/organization";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Tag } from "lucide-react";

interface BusinessDomainCardProps {
  domain: BusinessDomainDto;
  onEditAction: (domain: BusinessDomainDto) => void;
  onDeleteAction: (domain: BusinessDomainDto) => void;
}

export function BusinessDomainCard({ domain, onEditAction, onDeleteAction }: BusinessDomainCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border rounded-md">
            <AvatarImage src={domain.image} alt={domain.name} />
            <AvatarFallback className="rounded-md"><Tag className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-semibold line-clamp-1">{domain.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{domain.type_label}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditAction(domain)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteAction(domain)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground">
        <p className="line-clamp-2">{domain.description || "No description provided."}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => onEditAction(domain)}>View Details</Button>
      </CardFooter>
    </Card>
  );
}