"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProviderDto } from "@/types/organization";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export const getSuperAdminSupplierColumns = (): ColumnDef<ProviderDto>[] => [
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supplier" />
    ),
    cell: ({ row }) => {
      const supplier = row.original;
      const name = `${supplier.first_name || ""} ${
        supplier.last_name || ""
      }`.trim();
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={supplier.logo} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">
              {supplier.product_service_type}
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
    accessorKey: "contact_info",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
  },
];
