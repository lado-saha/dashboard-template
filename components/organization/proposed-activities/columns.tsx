"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProposedActivityDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Activity } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface RowActionsProps {
  activity: ProposedActivityDto;
  onEditAction: (activity: ProposedActivityDto) => void;
  onDeleteAction: (activity: ProposedActivityDto) => void;
}

const RowActions: React.FC<RowActionsProps> = ({ activity, onEditAction, onDeleteAction }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEditAction(activity)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteAction(activity)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getProposedActivityColumns = (
  actionHandlers: Omit<RowActionsProps, "activity">
): ColumnDef<ProposedActivityDto>[] => [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Activity Name" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("type")}</div>,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "rate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rate" className="justify-end" />,
    cell: ({ row }) => {
      const rate = parseFloat(row.getValue("rate"));
      const formatted = isNaN(rate) ? "N/A" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(rate);
      return <div className="text-right font-medium text-sm">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions activity={row.original} {...actionHandlers} />,
  },
];
