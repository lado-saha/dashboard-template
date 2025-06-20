"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductListItemData } from "@/types/product";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SlidersHorizontal,
  X,
  Package,
  Combine,
  Search,
  PlayCircle, // For ONGOING/IN_USE
  CheckCircle2, // For PUBLISHED/AVAILABLE/FINISHED
  InfoIcon, // For generic states
} from "lucide-react";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";
import { cn } from "@/lib/utils";

export const customerProductTypeOptions: DataTableFilterOption[] = [
  { label: "Resource", value: "RESOURCE", icon: Package },
  { label: "Service", value: "SERVICE", icon: Combine },
];

// Customer-facing product states - ensure these values match your data
export const customerProductStateOptions: DataTableFilterOption[] = [
  { label: "Published", value: "PUBLISHED", icon: CheckCircle2 }, // For Services
  { label: "Available", value: "AVAILABLE", icon: CheckCircle2 }, // For Resources
  { label: "Ongoing", value: "ONGOING", icon: PlayCircle },       // For Services
  // { label: "In Use", value: "IN_USE", icon: PlayCircle },      // For Resources (maybe less relevant as a filter *for* customers)
  // { label: "Finished", value: "FINISHED", icon: CheckCircle2 }, // For Services (maybe less relevant as primary filter)
  // Add other states if applicable, e.g., "PLANNED" if you show upcoming services
];


interface CustomerProductDataTableToolbarProps<TData extends ProductListItemData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilterAction: (value: string) => void;
}

export function CustomerProductDataTableToolbar<TData extends ProductListItemData>({
  table,
  globalFilter,
  setGlobalFilterAction,
}: CustomerProductDataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter;

  const resetAllFilters = () => {
    table.resetColumnFilters();
    setGlobalFilterAction("");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-x-4 gap-y-2 py-4">
      <div className="flex flex-1 flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search all..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilterAction(event.target.value)}
            className="h-10 w-full sm:w-[180px] lg:w-[250px] pl-10" // Adjusted width
          />
        </div>
        {table.getColumn("productType") && (
          <DataTableFacetedFilter
            column={table.getColumn("productType")}
            title="Type"
            options={customerProductTypeOptions}
          />
        )}
        {/* Add State Filter */}
        {table.getColumn("currentState") && (
          <DataTableFacetedFilter
            column={table.getColumn("currentState")}
            title="Status"
            options={customerProductStateOptions}
          />
        )}
      </div>

      <div className="flex items-center gap-x-2 w-full sm:w-auto justify-between sm:justify-end">
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetAllFilters}
            className="h-10 px-2 lg:px-3 text-sm"

          >
            Reset Filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              View Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" && column.getCanHide()
              )
              .map((column) => {
                const formatColumnId = (id: string) => {
                  return id
                    .replace(/([A-Z](?=[a-z]))|([A-Z]+(?=[A-Z][a-z]|$))/g, ' $1$2')
                    .replace(/_/g, " ")
                    .trim()
                    .replace(/\b\w/g, char => char.toUpperCase());
                };
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {formatColumnId(column.id)}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}