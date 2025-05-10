"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SlidersHorizontal, X, Package, Combine, CheckCircle, CircleDot, ClockIcon, Search } from "lucide-react"; // Added Search
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

export const productTypeOptions = [
  { label: "Resource", value: "RESOURCE", icon: Package },
  { label: "Service", value: "SERVICE", icon: Combine },
];
export const productStatusOptions = [
  { label: "Free", value: "FREE", icon: CheckCircle }, { label: "Affected", value: "AFFECTED", icon: CircleDot },
  { label: "In Use", value: "IN_USE", icon: CircleDot }, { label: "Planned", value: "PLANNED", icon: ClockIcon },
  { label: "Published", value: "PUBLISHED", icon: CheckCircle }, { label: "Ongoing", value: "ONGOING", icon: CircleDot },
  { label: "Finished", value: "FINISHED", icon: CheckCircle }, { label: "Cancelled", value: "CANCELLED", icon: X },
];

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string; // Receive global filter state
  setGlobalFilter: (value: string) => void; // Receive setter for global filter
}

export function ProductDataTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter;

  const resetAllFilters = () => {
    table.resetColumnFilters();
    setGlobalFilter("");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="flex flex-1 flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all fields..." // Changed placeholder
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)} // Use lifted global filter
            className="h-9 w-full sm:w-[180px] lg:w-[280px] pl-8" // Added padding for icon
          />
        </div>
        {table.getColumn("productType") && (
          <DataTableFacetedFilter
            column={table.getColumn("productType")}
            title="Type"
            options={productTypeOptions}
          />
        )}
        {table.getColumn("currentState") && (
          <DataTableFacetedFilter
            column={table.getColumn("currentState")}
            title="Status"
            options={productStatusOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetAllFilters} // Reset both column and global filters
            className="h-9 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Column Visibility Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Columns
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
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id.replace(/([A-Z])/g, ' $1').replace(/_/g, " ")}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}