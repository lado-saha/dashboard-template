"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BusinessDomainDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Tag } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RowActionsProps {
  domain: BusinessDomainDto;
  onEditAction: (domain: BusinessDomainDto) => void;
  onDeleteAction: (domain: BusinessDomainDto) => void;
}

const RowActions: React.FC<RowActionsProps> = ({ domain, onEditAction, onDeleteAction }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEditAction(domain)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteAction(domain)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getBusinessDomainColumns = (
  actionHandlers: Omit<RowActionsProps, "domain">
): ColumnDef<BusinessDomainDto>[] => [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Domain Name" />,
    cell: ({ row }) => {
      const domain = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border rounded-md">
            <AvatarImage src={domain.image} alt={domain.name} />
            <AvatarFallback className="rounded-md"><Tag className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{domain.name}</div>
            <div className="text-xs text-muted-foreground">{domain.type_label}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type Code" />,
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => <p className="text-sm text-muted-foreground truncate max-w-xs">{row.getValue("description")}</p>,
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions domain={row.original} {...actionHandlers} />,
  },
];