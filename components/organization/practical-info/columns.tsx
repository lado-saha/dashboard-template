"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PracticalInformationDto } from "@/types/organization";
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
import { MoreHorizontal, Edit3, Trash2, FileText } from "lucide-react"; // Using FileText as a generic icon for info type
import { format, parseISO, isValid } from "date-fns";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export interface PracticalInfoRowActionsProps {
  item: PracticalInformationDto;
  onEditAction: (item: PracticalInformationDto) => void;
  onDeleteAction: (item: PracticalInformationDto) => void;
  // No onViewDetails for this simple DTO, edit serves that purpose
}

const PracticalInfoRowActions: React.FC<PracticalInfoRowActionsProps> = ({
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

export const getPracticalInfoColumns = (
  actionHandlers: Omit<PracticalInfoRowActionsProps, "item">
): ColumnDef<PracticalInformationDto>[] => [
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
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="font-medium truncate max-w-xs">
          {row.getValue("type")}
        </span>
      </div>
    ),
    size: 250,
    filterFn: (row, id, value) => value.includes(row.getValue(id)), // For faceted filter
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Value" />
    ),
    cell: ({ row }) => (
      <div className="truncate max-w-md text-sm text-muted-foreground">
        {row.getValue("value")}
      </div>
    ),
    size: 400,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground/80 truncate max-w-sm">
        {row.getValue("notes") || ""}
      </div>
    ),
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("updated_at") as string;
      return (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {isValid(parseISO(date)) ? format(parseISO(date), "PPp") : "-"}
        </div>
      );
    },
    size: 170,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <PracticalInfoRowActions
          item={row.original}
          onEditAction={actionHandlers.onEditAction}
          onDeleteAction={actionHandlers.onDeleteAction}
        />
      </div>
    ),
    size: 80,
  },
];
