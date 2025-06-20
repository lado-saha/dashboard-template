"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { SlidersHorizontal, X, Search } from "lucide-react";

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
import { ViewMode } from "@/types/common";

/**
 * Formats a column ID (e.g., "lastModifiedAt") into a human-readable string ("Last Modified At").
 */
const formatColumnIdForDisplay = (id: string) => {
  return id
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

interface DataTableToolbarProps<TData> {
  /** The TanStack Table instance. */
  table: Table<TData>;
  /** The current global filter value. */
  globalFilter: string;
  /** Callback to update the global filter value. */
  onGlobalFilterChangeAction: (value: string) => void;
  /** Placeholder text for the search input. */
  searchPlaceholder?: string;
  /** A React node containing custom filter components (e.g., faceted filters). */
  filterControls?: React.ReactNode;
  /** A React node containing buttons or other controls for bulk actions. */
  bulkActions?: React.ReactNode;

  viewMode: ViewMode;
}

/**
 * A generic, reusable toolbar for TanStack DataTables. It provides slots for
 * search, custom filters, and contextual bulk actions that appear when rows are selected.
 */
export function DataTableToolbar<TData>({
  table,
  globalFilter,
  onGlobalFilterChangeAction,
  searchPlaceholder = "Search...",
  filterControls,
  bulkActions,
  viewMode,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || !!globalFilter;
  const numSelected = table.getFilteredSelectedRowModel().rows.length;

  // Render the contextual bulk action view when items are selected
  if (numSelected > 0 && bulkActions) {
    return (
      <div className="flex w-full items-center justify-between gap-4 rounded-md border border-dashed bg-muted/50 p-2.5 transition-all">
        <div className="flex-1 text-sm font-medium text-muted-foreground">
          {numSelected} row(s) selected
        </div>
        <div className="flex items-center gap-2">
          {bulkActions}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetRowSelection()}
            className="h-9"
            aria-label="Clear selection"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    );
  }

  // Render the default view with search and filters
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(event) => onGlobalFilterChangeAction(event.target.value)}
            className="h-10 w-full pl-10 sm:w-[200px] lg:w-[280px]"
          />
        </div>
        {filterControls}
      </div>

      <div className="flex items-center gap-2">
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              onGlobalFilterChangeAction("");
            }}
            className="h-10 px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        {viewMode === "list" && (
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
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {formatColumnIdForDisplay(column.id)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
