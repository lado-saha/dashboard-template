"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EmployeeDto, AgencyDto } from "@/types/organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Building2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export interface EmployeeRowActionsProps {
  employee: EmployeeDto;
  onEditAction: (employeeId: string) => void;
  onDeleteAction: (employee: EmployeeDto) => void;
}

const EmployeeRowActions: React.FC<EmployeeRowActionsProps> = ({
  employee,
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
        <DropdownMenuItem onClick={() => onEditAction(employee.employee_id!)}>
          <Edit3 className="mr-2 h-4 w-4" /> Edit Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDeleteAction(employee)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getEmployeeColumns = (
  actionHandlers: Omit<EmployeeRowActionsProps, "employee">,
  agencies: AgencyDto[]
): ColumnDef<EmployeeDto>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const employee = row.original;
      const fullName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
      const fallback = fullName ? fullName.charAt(0).toUpperCase() : "E";
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={employee.logo} alt={fullName} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{fullName}</span>
            <span className="text-xs text-muted-foreground">
              {employee.short_description || "No title specified"}
            </span>
          </div>
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: "employee_role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => (
      <div className="capitalize text-sm text-muted-foreground">
        {row.getValue("employee_role")?.toString().replace(/_/g, ' ').toLowerCase() || "N/A"}
      </div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.getValue("department") || "N/A"}</div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "agency_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assignment" />,
    cell: ({ row }) => {
      const agencyId = row.getValue("agency_id");
      if (!agencyId) {
        return <div className="text-sm text-muted-foreground">Headquarters</div>;
      }
      const agency = agencies.find(a => a.agency_id === agencyId);
      return (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{agency ? agency.long_name : "Unknown Agency"}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id) || "headquarters"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <EmployeeRowActions
          employee={row.original}
          onEditAction={actionHandlers.onEditAction}
          onDeleteAction={actionHandlers.onDeleteAction}
        />
      </div>
    ),
    size: 80,
  },
];
