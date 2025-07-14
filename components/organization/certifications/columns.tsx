"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CertificationDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Award } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export interface CertificationRowActionsProps {
  item: CertificationDto;
  onEditAction: (item: CertificationDto) => void;
  onDeleteAction: (item: CertificationDto) => void;
}

const CertificationRowActions: React.FC<CertificationRowActionsProps> = ({
  item,
  onEditAction,
  onDeleteAction,
}) => {
  return (
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
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEditAction(item)}>
          <Edit3 className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDeleteAction(item)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getCertificationColumns = (
  actionHandlers: Omit<CertificationRowActionsProps, "item">
): ColumnDef<CertificationDto>[] => [
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
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Certification Name" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="font-medium truncate max-w-xs">
          {row.getValue("name")}
        </span>
      </div>
    ),
    size: 300,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground truncate max-w-sm">
        {row.getValue("type")}
      </div>
    ),
    size: 250,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "obtainment_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Obtainment Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("obtainment_date") as string;
      return (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {isValid(parseISO(date || "")) ? format(parseISO(date), "PP") : "-"}
        </div>
      );
    },
    size: 180,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <CertificationRowActions
          item={row.original}
          onEditAction={actionHandlers.onEditAction}
          onDeleteAction={actionHandlers.onDeleteAction}
        />
      </div>
    ),
    size: 80,
  },
];
