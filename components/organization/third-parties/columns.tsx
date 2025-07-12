"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ThirdPartyDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Briefcase, CheckCircle, XCircle } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";

interface ThirdPartyRowActionsProps {
  thirdParty: ThirdPartyDto;
  onEditAction: (thirdParty: ThirdPartyDto) => void;
  onDeleteAction: (thirdParty: ThirdPartyDto) => void;
}

const ThirdPartyRowActions: React.FC<ThirdPartyRowActionsProps> = ({ thirdParty, onEditAction, onDeleteAction }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEditAction(thirdParty)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteAction(thirdParty)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getThirdPartyColumns = (
  actionHandlers: Omit<ThirdPartyRowActionsProps, "thirdParty">
): ColumnDef<ThirdPartyDto>[] => [
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
      const thirdParty = row.original;
      const name = thirdParty.name || "Unnamed Party";
      const fallback = name.charAt(0).toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border"><AvatarImage src={thirdParty.logo} alt={name} /><AvatarFallback>{fallback}</AvatarFallback></Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">{thirdParty.acronym}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("type") || "N/A"}</div>,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      const StatusIcon = isActive ? CheckCircle : XCircle;
      return (
        <Badge variant={isActive ? "default" : "destructive"} className="capitalize text-xs items-center font-normal">
          <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    id: "actions",
    cell: ({ row }) => <ThirdPartyRowActions thirdParty={row.original} {...actionHandlers} />,
  },
];
