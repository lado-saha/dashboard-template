"use client";

import React from "react";
import { OrganizationDto } from "@/types/organization";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  LogIn,
  Building,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface OrganizationCardProps {
  organization: OrganizationDto;
  onEnterAction: (organization: OrganizationDto) => void;
  onEditAction: (organizationId: string) => void;
  onDeleteAction: (organization: OrganizationDto) => void;
}

const getStatusInfo = (status: OrganizationDto["status"]) => {
  switch (status) {
    case "ACTIVE":
      return { icon: CheckCircle, color: "text-green-600", label: "Active" };
    case "INACTIVE":
      return { icon: XCircle, color: "text-slate-500", label: "Inactive" };
    case "PENDING_APPROVAL":
      return { icon: Clock, color: "text-amber-600", label: "Pending" };
    default:
      return {
        icon: XCircle,
        color: "text-destructive",
        label: status || "Unknown",
      };
  }
};

export function OrganizationCard({
  organization,
  onEnterAction,
  onEditAction,
  onDeleteAction,
}: OrganizationCardProps) {
  const statusInfo = getStatusInfo(organization.status);

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group">
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-4">
            {organization.logo_url ? (
              <Image
                src={organization.logo_url}
                alt={organization.long_name || ""}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover border"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border">
                <Building className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle
                className="text-md font-bold leading-tight line-clamp-2"
                title={organization.long_name}
              >
                {organization.long_name}
              </CardTitle>
              <CardDescription className="text-xs">
                {organization.short_name}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onEditAction(organization.organization_id!)}
              >
                <Edit3 className="mr-2 h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteAction(organization)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed min-h-[60px]">
          {organization.description || "No description provided."}
        </p>
      </CardContent>
      <CardFooter className="pt-3 pb-4 flex justify-between items-center">
        <Badge
          variant="outline"
          className={cn(
            "capitalize text-xs items-center font-normal",
            statusInfo.color
          )}
        >
          <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
          {statusInfo.label}
        </Badge>
        <Button size="sm" onClick={() => onEnterAction(organization)}>
          <LogIn className="mr-2 h-4 w-4" /> Enter
        </Button>
      </CardFooter>
    </Card>
  );
}
