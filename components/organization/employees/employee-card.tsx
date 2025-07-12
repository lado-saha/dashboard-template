"use client";

import React from "react";
import { EmployeeDto, AgencyDto } from "@/types/organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Building2, Briefcase } from "lucide-react";

interface EmployeeCardProps {
  employee: EmployeeDto;
  agency?: AgencyDto | null;
  onEditAction: (employeeId: string) => void;
  onDeleteAction: (employee: EmployeeDto) => void;
}

export function EmployeeCard({ employee, agency, onEditAction, onDeleteAction }: EmployeeCardProps) {
  const fullName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
  const fallback = fullName ? fullName.charAt(0).toUpperCase() : "E";
  const roleDisplay = employee.employee_role?.replace(/_/g, " ").toLowerCase() || "N/A";

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow group">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-background ring-1 ring-ring"><AvatarImage src={employee.logo} alt={fullName} /><AvatarFallback className="text-lg bg-muted">{fallback}</AvatarFallback></Avatar>
          <div>
            <CardTitle className="text-base font-semibold line-clamp-1">{fullName}</CardTitle>
            <p className="text-xs text-muted-foreground line-clamp-1">{employee.short_description || "No job title"}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditAction(employee.employee_id!)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteAction(employee)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize text-xs items-center font-normal"><Briefcase className="mr-1.5 h-3 w-3" />{roleDisplay}</Badge>
          {employee.department && <Badge variant="outline" className="capitalize text-xs items-center font-normal">{employee.department}</Badge>}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span>{agency ? agency.short_name : "Headquarters"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
