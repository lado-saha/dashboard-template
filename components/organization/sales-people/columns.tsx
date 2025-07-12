"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SalesPersonDto, AgencyDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Building2, UserCheck } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface SalesPersonRowActionsProps {
  salesPerson: SalesPersonDto;
  onEditAction: (salesPerson: SalesPersonDto) => void;
  onDeleteAction: (salesPerson: SalesPersonDto) => void;
}

const SalesPersonRowActions: React.FC<SalesPersonRowActionsProps> = ({ salesPerson, onEditAction, onDeleteAction }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEditAction(salesPerson)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteAction(salesPerson)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getSalesPersonColumns = (
  actionHandlers: Omit<SalesPersonRowActionsProps, "salesPerson">,
  agencies: AgencyDto[]
): ColumnDef<SalesPersonDto>[] => [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const salesPerson = row.original;
      const name = salesPerson.name || `${salesPerson.first_name || ""} ${salesPerson.last_name || ""}`.trim();
      const fallback = name ? name.charAt(0).toUpperCase() : "S";
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border"><AvatarImage src={salesPerson.logo} alt={name} /><AvatarFallback>{fallback}</AvatarFallback></Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">{salesPerson.short_description}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "commission_rate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Commission Rate" className="justify-end" />,
    cell: ({ row }) => <div className="text-right font-medium text-sm">{row.getValue("commission_rate") ? `${row.getValue("commission_rate")}%` : "N/A"}</div>,
  },
  {
    accessorKey: "agency_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assignment" />,
    cell: ({ row }) => {
      const agencyId = row.getValue("agency_id");
      if (!agencyId) return <div className="text-sm text-muted-foreground">Headquarters</div>;
      const agency = agencies.find(a => a.agency_id === agencyId);
      return (
        <div className="text-sm font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{agency ? agency.short_name : "Unknown Agency"}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id) || "headquarters"),
  },
  {
    id: "actions",
    cell: ({ row }) => <SalesPersonRowActions salesPerson={row.original} {...actionHandlers} />,
  },
]