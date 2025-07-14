"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CertificationDto } from "@/types/organization";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { format, parseISO, isValid } from "date-fns";
import { Award } from "lucide-react";

export const getSuperAdminCertificationColumns =
  (): ColumnDef<CertificationDto>[] => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Certification" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "organization_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Organization" />
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
    },
    {
      accessorKey: "obtainment_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Obtained" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("obtainment_date") as string;
        return (
          <div>
            {isValid(parseISO(date)) ? format(parseISO(date), "PP") : "-"}
          </div>
        );
      },
    },
  ];
