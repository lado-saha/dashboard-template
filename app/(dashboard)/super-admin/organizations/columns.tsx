"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OrganizationDto, OrganizationStatus } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ShieldQuestion,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { cn } from "@/lib/utils";

const getStatusInfo = (status: OrganizationDto["status"]) => {
  switch (status) {
    case "ACTIVE":
      return { icon: CheckCircle, color: "text-green-600", label: "Active" };
    case "INACTIVE":
      return { icon: XCircle, color: "text-slate-500", label: "Inactive" };
    case "PENDING_APPROVAL":
      return { icon: Clock, color: "text-amber-600", label: "Pending" };
    case "SUSPENDED":
      return {
        icon: ShieldQuestion,
        color: "text-red-600",
        label: "Suspended",
      };
    default:
      return {
        icon: XCircle,
        color: "text-destructive",
        label: status || "Unknown",
      };
  }
};

interface RowActionsProps {
  organization: OrganizationDto;
  onStatusChangeAction: (
    organization: OrganizationDto,
    status: OrganizationStatus
  ) => void;
  onDeleteAction: (organization: OrganizationDto) => void;
}

const RowActions: React.FC<RowActionsProps> = ({
  organization,
  onStatusChangeAction,
  onDeleteAction,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        onClick={() => onStatusChangeAction(organization, "ACTIVE")}
      >
        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve/Activate
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onStatusChangeAction(organization, "SUSPENDED")}
      >
        <ShieldQuestion className="mr-2 h-4 w-4 text-red-500" /> Suspend
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => onDeleteAction(organization)}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" /> Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const getSuperAdminOrganizationColumns = (
  actions: Omit<RowActionsProps, "organization">
): ColumnDef<OrganizationDto>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
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
            <AvatarImage src={org.logo_url} />
            <AvatarFallback>{org.short_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{org.long_name}</div>
            <div className="text-xs text-muted-foreground">{org.email}</div>
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
        <Badge variant="outline" className={cn("capitalize", statusInfo.color)}>
          <statusInfo.icon className="mr-1.5 h-3.5 w-3.5" />
          {statusInfo.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "business_actor_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner ID" />
    ),
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground truncate">
        {row.getValue("business_actor_id")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions organization={row.original} {...actions} />,
  },
];
