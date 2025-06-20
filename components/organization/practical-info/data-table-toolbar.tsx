"use client";

import { useMemo } from "react";
import { Table } from "@tanstack/react-table";
import { SlidersHorizontal, X, Search, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { PracticalInformationDto } from "@/types/organization";
import { DataTableFilterOption } from "@/types/table";

/**
 * Derives a sorted list of unique "type" options for the faceted filter.
 * @param items - The full list of practical information items.
 * @returns An array of options for the DataTableFacetedFilter.
 */
const getPracticalInfoTypeOptions = (
  items: PracticalInformationDto[]
): DataTableFilterOption[] => {
  // Use a Set to get unique, non-empty types, then map and sort.
  const uniqueTypes = [
    ...new Set(items.map((item) => item.type).filter(Boolean as any)),
  ];

  return uniqueTypes
    .map((type) => ({
      label: type,
      value: type,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Formats a column ID (e.g., "lastModifiedAt" or "info_type") into a human-readable string ("Last Modified At").
 */
const formatColumnIdForDisplay = (id: string) => {
  return id
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before uppercase letters
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};

interface PracticalInfoTableToolbarProps<
  TData extends PracticalInformationDto
> {
  table: Table<TData>;
  /** The current global filter value. */
  globalFilter: string;
  /** Callback to update the global filter value. */
  setGlobalFilterAction: (value: string) => void;
  /** The complete dataset, used to generate filter options dynamically. */
  allItemsForFilterOptions: TData[];
  onDeleteSelected?: () => void;
}

/**
 * A toolbar for the Practical Information data table, providing search,
 * filtering, and column visibility controls.
 */
export function PracticalInfoTableToolbar<
  TData extends PracticalInformationDto
>({
  table,
  globalFilter,
  setGlobalFilterAction,
  allItemsForFilterOptions,
  onDeleteSelected,
}: PracticalInfoTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || !!globalFilter;
  const numSelected = table.getFilteredSelectedRowModel().rows.length;

  // Memoize the derived options to prevent recalculating on every render.
  const derivedTypeOptions = useMemo(
    () => getPracticalInfoTypeOptions(allItemsForFilterOptions),
    [allItemsForFilterOptions]
  );
  if (numSelected > 0) {
    // --- RENDER THE BULK ACTIONS VIEW ---
    return (
      <div className="flex w-full items-center justify-between gap-4 rounded-md border border-dashed bg-muted/50 p-2.5">
        <div className="flex-1 text-sm font-medium text-muted-foreground">
          {numSelected} item(s) selected
        </div>
        <div className="flex items-center gap-2">
          {onDeleteSelected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelected}
              className="h-9"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetRowSelection()}
            className="h-9"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Left Side: Search and Filters */}
      <div className="flex flex-col sm:flex-row flex-1 items-center gap-2">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all fields..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilterAction(event.target.value)}
            className="h-10 w-full sm:w-[200px] lg:w-[280px] pl-10"
          />
        </div>
        {table.getColumn("type") && derivedTypeOptions.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn("type")}
            title="Type"
            options={derivedTypeOptions}
          />
        )}
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-2">
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              setGlobalFilterAction("");
            }}
            className="h-10 px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-full sm:w-auto"
            >
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
                (col) =>
                  typeof col.accessorFn !== "undefined" && col.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {formatColumnIdForDisplay(column.id)}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
