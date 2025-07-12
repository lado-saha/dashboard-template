"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserDto } from "@/types/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Shield, Ban } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface RowActionsProps {
  user: UserDto;
  onEditAction: (user: UserDto) => void;
}

const RowActions: React.FC<RowActionsProps> = ({ user, onEditAction }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEditAction(user)}><Edit className="mr-2 h-4 w-4" /> Edit User</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive"><Ban className="mr-2 h-4 w-4" /> Disable User</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getUserColumns = (actionHandlers: Omit<RowActionsProps, "user">): ColumnDef<UserDto>[] => [
  { id: "select", header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />, enableSorting: false, enableHiding: false },
  {
    accessorKey: "first_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => {
      const user = row.original;
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
      const fallback = name ? name.charAt(0).toUpperCase() : "U";
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border"><AvatarImage src={undefined} alt={name} /><AvatarFallback>{fallback}</AvatarFallback></Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  { accessorKey: "username", header: ({ column }) => <DataTableColumnHeader column={column} title="Username" /> },
  {
    accessorKey: "is_enabled",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <Badge variant={row.getValue("is_enabled") ? "default" : "destructive"}>{row.getValue("is_enabled") ? "Enabled" : "Disabled"}</Badge>,
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  { id: "actions", cell: ({ row }) => <RowActions user={row.original} {...actionHandlers} /> },
];
