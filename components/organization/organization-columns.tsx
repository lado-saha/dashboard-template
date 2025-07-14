"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OrganizationDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

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

interface OrganizationRowActionsProps {
  organization: OrganizationDto;
  onEnterAction: (organization: OrganizationDto) => void;
  onEditAction: (organizationId: string) => void;
  onDeleteAction: (organization: OrganizationDto) => void;
}

const OrganizationRowActions: React.FC<OrganizationRowActionsProps> = ({
  organization,
  onEnterAction,
  onEditAction,
  onDeleteAction,
}) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={() => onEnterAction(organization)}
      >
        <LogIn className="mr-1.5 h-3.5 w-3.5" /> Enter
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => onEditAction(organization.organization_id!)}
          >
            <Edit3 className="mr-2 h-4 w-4" /> Edit
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
  );
};

export const getOrganizationColumns = (
  actionHandlers: Omit<OrganizationRowActionsProps, "organization">
): ColumnDef<OrganizationDto>[] => [
  {
    id: "select",
    header: ({ table }) => (
    <Checkbox checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />

    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "long_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization" />
    ),
    cell: ({ row }) => {
      const org = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={org.logo_url} alt={org.long_name} />
            <AvatarFallback>{org.short_name?.charAt(0) || "O"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{org.long_name}</div>
            <div className="text-xs text-muted-foreground">
              {org.short_name}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const statusInfo = getStatusInfo(row.getValue("status"));
      return (
        <Badge variant="outline" className={`capitalize ${statusInfo.color}`}>
          <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
          {statusInfo.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact Email" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <OrganizationRowActions organization={row.original} {...actionHandlers} />
    ),
  },
];
