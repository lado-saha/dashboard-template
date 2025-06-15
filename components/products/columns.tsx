"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProductListItemData } from "@/lib/types/product";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Eye, RefreshCw, ArrowUpDown, Clock, Package, Combine, PlayCircle, CheckCircle2, XCircle, Loader2, InfoIcon, CircleDot, CircleSlash } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

// Helper for state badge, icon, and label (MODIFIED TO RETURN OBJECT)
interface StateDisplayInfo {
  variant: "default" | "secondary" | "outline" | "destructive";
  icon: React.ElementType;
  label: string;
}

const getStateDisplayInfo = (state: string = ""): StateDisplayInfo => {
  const upperState = state.toUpperCase();
  const label = upperState.toLowerCase().replace(/_/g, " "); // Keep underscore replacement for label
  switch (upperState) {
    case "FREE": case "AVAILABLE": return { variant: "default", icon: CheckCircle2, label };
    case "PUBLISHED": case "FINISHED": return { variant: "default", icon: CheckCircle2, label };
    case "AFFECTED": case "PLANNED": return { variant: "secondary", icon: Clock, label };
    case "IN_USE": case "ONGOING": return { variant: "outline", icon: CircleDot, label };
    case "CANCELLED": case "DELETED": return { variant: "destructive", icon: CircleSlash, label };
    default: return { variant: "outline", icon: InfoIcon, label: label || "Unknown" }; // Use formatted label or Unknown
  }
};


export interface ProductRowActionsProps {
  product: ProductListItemData;
  onEdit: (product: ProductListItemData) => void;
  onDelete: (product: ProductListItemData) => void;
  onChangeState: (product: ProductListItemData, newState: string) => void;
  onViewDetails: (product: ProductListItemData) => void;
  resourceStateTransitions: Record<string, string[]>;
  serviceStateTransitions: Record<string, string[]>;
  isItemActionLoading: boolean;
}

const ProductRowActions: React.FC<ProductRowActionsProps> = ({
  product, onEdit, onDelete, onChangeState, onViewDetails,
  resourceStateTransitions, serviceStateTransitions, isItemActionLoading
}) => {
  const getAvailableTransitions = (prod: ProductListItemData) => {
    if (prod.productType === "RESOURCE") {
      return resourceStateTransitions[prod.currentState.toUpperCase()] || [];
    }
    if (prod.productType === "SERVICE") {
      return serviceStateTransitions[prod.currentState.toUpperCase()] || [];
    }
    return [];
  };
  const availableTransitions = getAvailableTransitions(product);

  const getStateChangeIcon = (nextState: string) => {
    switch (nextState.toUpperCase()) {
      case "PUBLISHED": case "ONGOING": case "AFFECTED": case "IN_USE": return PlayCircle;
      case "FINISHED": return CheckCircle2;
      case "CANCELLED": case "FREE": return XCircle;
      default: return RefreshCw;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted" disabled={isItemActionLoading}>
          {isItemActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onViewDetails(product)}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(product)}>
          <Edit3 className="mr-2 h-4 w-4" /> Edit Product
        </DropdownMenuItem>
        {availableTransitions.length > 0 && <DropdownMenuSeparator />}
        {availableTransitions.map(nextState => {
          const Icon = getStateChangeIcon(nextState);
          return (
            <DropdownMenuItem key={nextState} onClick={() => onChangeState(product, nextState)}>
              <Icon className="mr-2 h-4 w-4" /> Change to {nextState.toLowerCase().replace(/_/g, " ")}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(product)}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Product
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getProductColumns = (
  actionHandlers: Omit<ProductRowActionsProps, 'product' | 'isItemActionLoading'> & { getIsItemActionLoading: (productId: string) => boolean }
): ColumnDef<ProductListItemData>[] => [
    {
      id: "select",
      header: ({ table }) => ( /* ... Checkbox ... */
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      ),
      cell: ({ row }) => ( /* ... Checkbox ... */
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      ),
      enableSorting: false, enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => { /* ... Name cell with clickable and scheduled info ... */
        const product = row.original;
        return (
          <div className="flex flex-col max-w-[200px] sm:max-w-[300px]">
            <button
              type="button"
              className="font-medium text-left truncate hover:text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded-sm"
              title={product.name}
              onClick={() => actionHandlers.onViewDetails(product)}
            > {product.name} </button>
            {product.isScheduled && product.scheduledAt && isValid(parseISO(product.scheduledAt)) && (
              <div className="text-xs text-muted-foreground flex items-center mt-0.5 whitespace-nowrap">
                <Clock className="h-3 w-3 mr-1 flex-shrink-0 text-sky-600" />
                Scheduled: {format(parseISO(product.scheduledAt), "PPp")}
              </div>
            )}
          </div>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: "productType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => { /* ... Type badge with icon ... */
        const Icon = row.original.productType === "RESOURCE" ? Package : Combine;
        return (
          <Badge variant={row.original.productType === "RESOURCE" ? "outline" : "secondary"} className="capitalize text-xs items-center">
            <Icon className="mr-1.5 h-3.5 w-3.5 opacity-80" />
            {row.original.productType.toLowerCase()}
          </Badge>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "currentState",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        // Use the corrected helper function
        const stateInfo = getStateDisplayInfo(row.original.currentState);
        const StatusIcon = stateInfo.icon; // Get the icon from helper
        return (
          <Badge variant={stateInfo.variant} className="capitalize text-xs items-center">
            <StatusIcon className="mr-1.5 h-3.5 w-3.5 opacity-80" />
            {stateInfo.label} {/* Use label from helper */}
          </Badge>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "basePrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" className="justify-end" />,
      cell: ({ row }) => { /* ... Price cell ... */
        const amount = parseFloat(row.getValue("basePrice"));
        if (isNaN(amount)) return <div className="text-right font-medium text-muted-foreground">N/A</div>;
        const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
      cell: ({ row }) => ( /* ... UpdatedAt cell ... */
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {format(parseISO(row.original.updatedAt), "PP")}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <ProductRowActions
            product={row.original}
            onEdit={actionHandlers.onEdit}
            onDelete={actionHandlers.onDelete}
            onChangeState={actionHandlers.onChangeState}
            onViewDetails={actionHandlers.onViewDetails}
            resourceStateTransitions={actionHandlers.resourceStateTransitions}
            serviceStateTransitions={actionHandlers.serviceStateTransitions}
            isItemActionLoading={actionHandlers.getIsItemActionLoading(row.original.id)}
          />
        </div>
      ),
      enableSorting: false, enableHiding: false,
    },
  ];