"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AgencyDto } from "@/types/organization";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export const getSuperAdminAgencyColumns = (): ColumnDef<AgencyDto>[] => [
  {
    accessorKey: "long_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agency" />
    ),
    cell: ({ row }) => {
      const agency = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={agency.logo} />
            <AvatarFallback>{agency.short_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{agency.long_name}</div>
            <div className="text-xs text-muted-foreground">
              {agency.location}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "organization_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.organization_id}
      </div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <Badge
          variant={isActive ? "default" : "destructive"}
          className={isActive ? "bg-green-100 text-green-800" : ""}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    accessorKey: "total_affiliated_customers",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Customers"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.getValue("total_affiliated_customers") || 0}
      </div>
    ),
  },
];
