"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserDto } from "@/types/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Phone,
  Mail,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface UserRowActionsProps {
  user: UserDto;
  onStatusToggleAction: (user: UserDto) => void;
  onVerifyAction: (user: UserDto, type: "email" | "phone") => void;
}

const RowActions: React.FC<UserRowActionsProps> = ({
  user,
  onStatusToggleAction,
  onVerifyAction,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onStatusToggleAction(user)}>
        {user.is_enabled ? (
          <XCircle className="mr-2 h-4 w-4 text-destructive" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
        )}
        {user.is_enabled ? "Disable" : "Enable"}
      </DropdownMenuItem>
      {!user.email_verified && (
        <DropdownMenuItem onClick={() => onVerifyAction(user, "email")}>
          <Mail className="mr-2 h-4 w-4" /> Verify Email
        </DropdownMenuItem>
      )}
      {!user.phone_number_verified && (
        <DropdownMenuItem onClick={() => onVerifyAction(user, "phone")}>
          <Phone className="mr-2 h-4 w-4" /> Verify Phone
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export const getUserColumns = (
  actions: Omit<UserRowActionsProps, "user">
): ColumnDef<UserDto>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">
              @{user.username}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "is_enabled",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isEnabled = row.getValue("is_enabled");
      return (
        <Badge
          variant={isEnabled ? "default" : "destructive"}
          className={isEnabled ? "bg-green-100 text-green-800" : ""}
        >
          {isEnabled ? "Enabled" : "Disabled"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    accessorKey: "email_verified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verification" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.email_verified && (
          <ShieldCheck className="h-4 w-4 text-sky-500" />
        )}
        {row.original.phone_number_verified && (
          <Phone className="h-4 w-4 text-sky-500" />
        )}
      </div>
    ),
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions user={row.original} {...actions} />,
  },
];
