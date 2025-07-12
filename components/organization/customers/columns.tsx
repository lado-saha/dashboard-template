"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AgencyDto, CustomerDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Building2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface CustomerRowActionsProps {
  customer: CustomerDto;
  onEditAction: (customer: CustomerDto) => void;
  onDeleteAction: (customer: CustomerDto) => void;
}

const CustomerRowActions: React.FC<CustomerRowActionsProps> = ({ customer, onEditAction, onDeleteAction }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEditAction(customer)}>
          <Edit3 className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteAction(customer)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getCustomerColumns = (
  actionHandlers: Omit<CustomerRowActionsProps, "customer">, agencies: AgencyDto[] 
): ColumnDef<CustomerDto>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
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
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const customer = row.original;
      const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
      const fallback = fullName ? fullName.charAt(0).toUpperCase() : "C";
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={customer.logo} alt={fullName} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-xs text-muted-foreground">{customer.short_description}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Payment Method" />,
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("payment_method") || "N/A"}</div>,
  },
  {
    accessorKey: "amount_paid",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Amount Paid" className="justify-end" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount_paid"));
      const formatted = isNaN(amount) ? "N/A" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
      return <div className="text-right font-medium text-sm">{formatted}</div>;
    },
  },
   {
    accessorKey: "agency_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assignment" />,
    cell: ({ row }) => {
      const agencyId = row.getValue("agency_id");
      if (!agencyId) {
        return <div className="text-sm text-muted-foreground">Headquarters</div>;
      }
      const agency = agencies.find(a => a.agency_id === agencyId);
      return (
        <div className="text-sm font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{agency ? agency.short_name : "Unknown Agency"}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id) || "headquarters"),},
  {
    id: "actions",
    cell: ({ row }) => <CustomerRowActions customer={row.original} {...actionHandlers} />,
  },
];