"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { ProductListItemData } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShoppingCart,
  Info,
  Package,
  Combine,
  PlayCircle,
  CheckCircle2,
  InfoIcon as StatusInfoIcon,
  CircleSlash, // Renamed to avoid conflict
} from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

// Helper for state display (can be moved to a shared utils file if used elsewhere)
interface StateDisplayInfo {
  variant: "default" | "secondary" | "outline" | "destructive";
  icon: React.ElementType;
  label: string;
}

const getStateDisplayInfo = (state: string = ""): StateDisplayInfo => {
  const upperState = state.toUpperCase();
  const label = upperState.toLowerCase().replace(/_/g, " ");
  switch (upperState) {
    case "PUBLISHED":
    case "AVAILABLE":
    case "FINISHED":
      return { variant: "default", icon: CheckCircle2, label };
    case "PLANNED": // Assuming customers might see planned services
      return { variant: "secondary", icon: PlayCircle, label }; // Or a clock icon
    case "ONGOING": // For active services
      return { variant: "outline", icon: PlayCircle, label };
    // case "IN_USE": // For resources, might not be a primary filter for customers
    //   return { variant: "outline", icon: PlayCircle, label };
    case "CANCELLED":
      return { variant: "destructive", icon: CircleSlash, label };
    default:
      return {
        variant: "outline",
        icon: StatusInfoIcon,
        label: label || "Unknown",
      };
  }
};

export interface CustomerProductRowActionsProps {
  product: ProductListItemData;
  onViewDetails: (product: ProductListItemData) => void;
  onReserve: (product: ProductListItemData) => void;
}

const CustomerProductRowActions: React.FC<CustomerProductRowActionsProps> = ({
  product,
  onViewDetails,
  onReserve,
}) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={() => onViewDetails(product)}
        title="View Details"
      >
        <Info className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:ml-1.5">Details</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        className="h-8 px-2"
        onClick={() => onReserve(product)}
        title="Reserve or Enquire"
      >
        <ShoppingCart className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:ml-1.5">Reserve</span>
      </Button>
    </div>
  );
};

export const getCustomerProductColumns = (
  actionHandlers: Omit<CustomerProductRowActionsProps, "product">
): ColumnDef<ProductListItemData>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
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
    id: "imageAndName",
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product / Service" />
    ),
    cell: ({ row }) => {
      /* ... same as before ... */
      const product = row.original;
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="h-12 w-12 flex-shrink-0 rounded-md overflow-hidden">
            {product.imageUrl && product.imageUrl !== "/placeholder.svg" ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={48}
                height={48}
                className="object-cover h-full w-full"
              />
            ) : (
              <ImagePlaceholder
                iconType={
                  product.productType === "RESOURCE" ? "resource" : "service"
                }
                className="h-12 w-12"
                iconClassName="h-6 w-6"
              />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="font-medium text-sm leading-snug line-clamp-2 hover:text-primary cursor-pointer truncate"
              onClick={() => actionHandlers.onViewDetails(product)}
              title={product.name}
            >
              {product.name}
            </span>
            {product.baInfo && (
              <span
                className="text-xs text-muted-foreground flex items-center mt-0.5 truncate"
                title={`Offered by ${product.baInfo.name}`}
              >
                <Avatar className="h-4 w-4 mr-1.5 border flex-shrink-0">
                  <AvatarImage
                    src={product.baInfo.logoUrl}
                    alt={product.baInfo.name}
                  />
                  <AvatarFallback className="text-[8px] bg-secondary text-secondary-foreground">
                    {product.baInfo.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{product.baInfo.name}</span>
              </span>
            )}
          </div>
        </div>
      );
    },
    enableHiding: false,
    size: 300,
  },
  {
    accessorKey: "productType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      /* ... same as before ... */
      const ProductIcon =
        row.original.productType === "RESOURCE" ? Package : Combine;
      return (
        <Badge
          variant={
            row.original.productType === "RESOURCE" ? "outline" : "secondary"
          }
          className="capitalize text-xs items-center font-normal"
        >
          <ProductIcon className="mr-1.5 h-3.5 w-3.5 opacity-80" />
          {row.original.productType.toLowerCase()}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 120,
  },
  {
    // ADDED currentState column for filtering
    accessorKey: "currentState",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const stateInfo = getStateDisplayInfo(row.original.currentState);
      const StatusIconComponent = stateInfo.icon;
      return (
        <Badge
          variant={stateInfo.variant}
          className="capitalize text-xs items-center font-normal"
        >
          <StatusIconComponent className="mr-1.5 h-3.5 w-3.5 opacity-80" />
          {stateInfo.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)), // Faceted filter needs this
    size: 130,
  },
  {
    accessorKey: "basePrice",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Price"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      /* ... same as before ... */
      const amount = row.original.basePrice;
      if (amount === undefined || amount === null)
        return (
          <div className="text-right text-sm text-muted-foreground italic">
            N/A
          </div>
        );
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="text-right font-medium text-sm">{formatted}</div>;
    },
    sortingFn: "alphanumeric",
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CustomerProductRowActions
        product={row.original}
        onViewDetails={actionHandlers.onViewDetails}
        onReserve={actionHandlers.onReserve}
      />
    ),
    enableSorting: false,
    enableHiding: false, // Typically keep actions visible for customers
    size: 150,
  },
];
