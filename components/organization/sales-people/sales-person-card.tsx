"use client";

import React from "react";
import { SalesPersonDto, AgencyDto } from "@/types/organization";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Building2, Percent } from "lucide-react";

interface SalesPersonCardProps {
  salesPerson: SalesPersonDto;
  agencies: AgencyDto[];
  onEditAction: (salesPerson: SalesPersonDto) => void;
  onDeleteAction: (salesPerson: SalesPersonDto) => void;
}

export function   SalesPersonCard({ salesPerson, agencies, onEditAction, onDeleteAction }: SalesPersonCardProps) {
  const name = salesPerson.name || `${salesPerson.first_name || ""} ${salesPerson.last_name || ""}`.trim();
  const fallback = name ? name.charAt(0).toUpperCase() : "S";
  const agency = agencies.find(a => a.agency_id === salesPerson.agency_id);

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border"><AvatarImage src={salesPerson.logo} alt={name} /><AvatarFallback className="text-lg">{fallback}</AvatarFallback></Avatar>
          <div>
            <CardTitle className="text-base font-semibold line-clamp-1">{name}</CardTitle>
            <p className="text-xs text-muted-foreground">{salesPerson.short_description || "Sales Representative"}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditAction(salesPerson)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteAction(salesPerson)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Percent className="mr-2 h-4 w-4" />
          <span>Commission: {salesPerson.commission_rate ? `${salesPerson.commission_rate}%` : "Not set"}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Building2 className="mr-2 h-4 w-4" />
          <span>{agency ? agency.short_name : "Headquarters"}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => onEditAction(salesPerson)}>View Details</Button>
      </CardFooter>
    </Card>
  );
}