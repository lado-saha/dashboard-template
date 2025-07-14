"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CustomerDto } from "@/types/organization";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export const getSuperAdminCustomerColumns = (): ColumnDef<CustomerDto>[] => [
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => {
      const customer = row.original;
      const name = `${customer.first_name || ""} ${
        customer.last_name || ""
      }`.trim();
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={customer.logo} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">
              {customer.short_description}
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
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "agency_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agency" />
    ),
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Payment" />
    ),
  },
];
