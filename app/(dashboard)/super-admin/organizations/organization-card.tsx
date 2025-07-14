"use client";

import { OrganizationDto, OrganizationStatus } from "@/types/organization";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Building, CheckCircle, XCircle, Clock, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const getStatusInfo = (status: OrganizationDto['status']) => {
  switch (status) {
    case "ACTIVE": return { icon: CheckCircle, color: "text-green-600", label: "Active" };
    case "INACTIVE": return { icon: XCircle, color: "text-slate-500", label: "Inactive" };
    case "PENDING_APPROVAL": return { icon: Clock, color: "text-amber-600", label: "Pending" };
    case "SUSPENDED": return { icon: ShieldQuestion, color: "text-red-600", label: "Suspended" };
    default: return { icon: XCircle, color: "text-destructive", label: status || "Unknown" };
  }
};

interface AdminOrganizationCardProps {
  organization: OrganizationDto;
  onStatusChangeAction: (organization: OrganizationDto, status: OrganizationStatus) => void;
  onDeleteAction: (organization: OrganizationDto) => void;
}

export function AdminOrganizationCard({ organization, onStatusChangeAction, onDeleteAction }: AdminOrganizationCardProps) {
  const statusInfo = getStatusInfo(organization.status);

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-xl transition-all duration-300 ease-in-out group">
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-4">
            <Image src={organization.logo_url || '/placeholder.svg'} alt={organization.long_name || ""} width={48} height={48} className="h-12 w-12 rounded-lg object-cover border" />
            <div>
              <CardTitle className="text-md font-bold leading-tight line-clamp-2">{organization.long_name}</CardTitle>
              <CardDescription className="text-xs">{organization.short_name}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusChangeAction(organization, 'ACTIVE')}><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve/Activate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChangeAction(organization, 'SUSPENDED')}><ShieldQuestion className="mr-2 h-4 w-4 text-red-500" /> Suspend</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDeleteAction(organization)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed min-h-[60px]">
          {organization.description || "No description provided."}
        </p>
      </CardContent>
      <CardFooter>
        <Badge variant="outline" className={cn("capitalize text-xs items-center font-normal", statusInfo.color)}>
          <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
          {statusInfo.label}
        </Badge>
      </CardFooter>
    </Card>
  );
}