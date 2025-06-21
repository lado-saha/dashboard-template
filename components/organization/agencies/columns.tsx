"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AgencyDto } from "@/types/organization";
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
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface AgencyRowActionsProps {
  agency: AgencyDto;
  onEnterAction: (agency: AgencyDto) => void;
  onEditAction: (agencyId: string) => void;
  onDeleteAction: (agency: AgencyDto) => void;
}

const AgencyRowActions: React.FC<AgencyRowActionsProps> = ({
  agency,
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
        onClick={() => onEnterAction(agency)}
      >
        <LogIn className="mr-1.5 h-3.5 w-3.5" /> Enter
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => onEditAction(agency.agency_id!)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
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
  );
};

export const getAgencyColumns = (
  actionHandlers: Omit<AgencyRowActionsProps, "agency">
): ColumnDef<AgencyDto>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
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
    size: 40,
  },
  {
    accessorKey: "long_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agency Name" />
    ),
    cell: ({ row }) => {
      const agency = row.original;
      const fallback = agency.long_name
        ? agency.long_name.charAt(0).toUpperCase()
        : "A";
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={agency.logo} alt={agency.long_name} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{agency.long_name}</div>
            <div className="text-xs text-muted-foreground">
              {agency.short_name}
            </div>
          </div>
        </div>
      );
    },
    size: 300,
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      const StatusIcon = isActive ? CheckCircle : XCircle;
      return (
        <Badge
          variant={isActive ? "default" : "destructive"}
          className="capitalize text-xs items-center font-normal"
        >
          <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    accessorKey: "manager_name",
    header: "Manager",
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
      <div className="text-right">
        {row.getValue("total_affiliated_customers") || 0}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <AgencyRowActions agency={row.original} {...actionHandlers} />
    ),
  },
];
