"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BusinessActorDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, CheckCircle, XCircle } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface BusinessActorRowActionsProps {
  actor: BusinessActorDto;
  onEditAction: (actor: BusinessActorDto) => void;
  onDeleteAction: (actor: BusinessActorDto) => void;
}

const RowActions: React.FC<BusinessActorRowActionsProps> = ({ actor, onEditAction, onDeleteAction }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onEditAction(actor)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
      <DropdownMenuItem onClick={() => onDeleteAction(actor)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const getBusinessActorColumns = (actions: Omit<BusinessActorRowActionsProps, "actor">): ColumnDef<BusinessActorDto>[] => [
  { id: "select", header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />, enableSorting: false, enableHiding: false },
  { accessorKey: "first_name", header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />, cell: ({ row }) => {
    const actor = row.original;
    const name = `${actor.first_name || ''} ${actor.last_name || ''}`.trim();
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9"><AvatarImage src={actor.avatar_picture} /><AvatarFallback>{name.charAt(0)}</AvatarFallback></Avatar>
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{actor.email}</div>
        </div>
      </div>
    );
  }},
  { accessorKey: "type", header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />, cell: ({ row }) => <Badge variant="outline">{row.getValue("type")}</Badge>, filterFn: (row, id, value) => value.includes(row.getValue(id)) },
  { accessorKey: "is_active", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => {
    const isActive = row.getValue("is_active");
    return <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-100 text-green-800" : ""}>{isActive ? "Active" : "Inactive"}</Badge>;
  }, filterFn: (row, id, value) => value.includes(String(row.getValue(id))) },
  { accessorKey: "is_verified", header: ({ column }) => <DataTableColumnHeader column={column} title="Verified" />, cell: ({ row }) => {
    const isVerified = row.getValue("is_verified");
    return isVerified ? <CheckCircle className="h-5 w-5 text-sky-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />;
  }, filterFn: (row, id, value) => value.includes(String(row.getValue(id))) },
  { id: "actions", cell: ({ row }) => <RowActions actor={row.original} {...actions} /> },
];