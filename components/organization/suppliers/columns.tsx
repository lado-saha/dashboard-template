"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProviderDto, AgencyDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Building2, Truck } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface SupplierRowActionsProps {
  supplier: ProviderDto;
  onEditAction: (supplier: ProviderDto) => void;
  onDeleteAction: (supplier: ProviderDto) => void;
}

const SupplierRowActions: React.FC<SupplierRowActionsProps> = ({ supplier, onEditAction, onDeleteAction }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEditAction(supplier)}>
          <Edit3 className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteAction(supplier)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getSupplierColumns = (
  actionHandlers: Omit<SupplierRowActionsProps, "supplier">,
  agencies: AgencyDto[]
): ColumnDef<ProviderDto>[] => [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />
,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier Name" />,
    cell: ({ row }) => {
      const supplier = row.original;
      const fullName = `${supplier.first_name || ""} ${supplier.last_name || ""}`.trim();
      const fallback = fullName ? fullName.charAt(0).toUpperCase() : "S";
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={supplier.logo} alt={fullName} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-xs text-muted-foreground">{supplier.short_description}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "product_service_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service Type" />,
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("product_service_type") || "N/A"}</div>,
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
    cell: ({ row }) => <SupplierRowActions supplier={row.original} {...actionHandlers} />,
  },
];