"use client";

import React from "react";
import { AgencyDto } from "@/types/organization";
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
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AgencyCardProps {
  agency: AgencyDto;
  onEnterAction: (agency: AgencyDto) => void;
  onEditAction: (agencyId: string) => void;
  onDeleteAction: (agency: AgencyDto) => void;
}

export function AgencyCard({
  agency,
  onEnterAction,
  onEditAction,
  onDeleteAction,
}: AgencyCardProps) {
  const statusInfo = agency.is_active
    ? { icon: CheckCircle, color: "text-green-500", label: "Active" }
    : { icon: XCircle, color: "text-destructive", label: "Inactive" };

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group">
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-4">
            {agency.logo ? (
              <Image
                src={agency.logo}
                alt={agency.long_name || ""}
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
                title={agency.long_name}
              >
                {agency.long_name}
              </CardTitle>
              <CardDescription className="text-xs">
                {agency.short_name}
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
                <span className="sr-only">Agency actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditAction(agency.agency_id!)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteAction(agency)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm py-2">
        <div className="flex items-center text-muted-foreground text-xs">
          <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <span>{agency.location || "Location not set"}</span>
        </div>
        <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed min-h-[48px]">
          {agency.description || "No description provided."}
        </p>
        <div className="flex flex-wrap gap-1">
          {agency.business_domains?.slice(0, 2).map((domain, index) => (
            <Badge key={index} variant="secondary" className="font-normal">
              {domain}
            </Badge>
          ))}
          {(agency.business_domains?.length ?? 0) > 2 && (
            <Badge variant="outline">
              +{(agency.business_domains?.length ?? 0) - 2} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 pb-4 flex justify-between items-center">
        <Badge
          variant={agency.is_active ? "default" : "destructive"}
          className={cn(
            "capitalize text-xs items-center px-2 py-0.5",
            agency.is_active
              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
              : ""
          )}
        >
          <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
          {statusInfo.label}
        </Badge>
        <Button size="sm" onClick={() => onEnterAction(agency)}>
          <LogIn className="mr-2 h-4 w-4" /> Enter
        </Button>
      </CardFooter>
    </Card>
  );
}