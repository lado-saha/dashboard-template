"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { SlidersHorizontal, X, Search, LayoutGrid, LayoutList, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewMode } from "@/types/common";
import { cn } from "@/lib/utils";

const formatColumnIdForDisplay = (id: string) => {
  return id
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  onGlobalFilterChangeAction: (value: string) => void;
  searchPlaceholder?: string;
  filterControls?: React.ReactNode;
  bulkActions?: React.ReactNode;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExportAction?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  globalFilter,
  onGlobalFilterChangeAction,
  searchPlaceholder = "Search...",
  filterControls,
  bulkActions,
  viewMode,
  onViewModeChange,
  onExportAction,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter;
  const numSelected = table.getFilteredSelectedRowModel().rows.length;

  if (numSelected > 0 && bulkActions) {
    return (
      <div className="flex w-full items-center justify-between gap-4 rounded-md border border-dashed bg-muted/50 p-2.5 transition-all">
        <div className="flex-1 text-sm font-medium text-muted-foreground">
          {numSelected} {numSelected === 1 ? "item" : "items"} selected
        </div>
        <div className="flex items-center gap-2">
          {bulkActions}
          <Button variant="ghost" size="sm" onClick={() => table.resetRowSelection()} className="h-9" aria-label="Clear selection">
            <X className="mr-2 h-4 w-4" /> Clear
          </Button>
        </div>
      </div>
    );
  }

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
        {isFiltered && (
          <Button variant="ghost" onClick={() => { table.resetColumnFilters(); onGlobalFilterChangeAction(""); }} className="h-10 px-3">
            Reset <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* [START OF CHANGE] */}
        <div className="flex items-center p-0.5 bg-muted rounded-md">
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => onViewModeChange("grid")} className={cn("h-9 px-3", viewMode === "grid" && "bg-background text-foreground shadow-sm")}>
            <LayoutGrid className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Grid</span>
          </Button>
          <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => onViewModeChange("list")} className={cn("h-9 px-3", viewMode === "list" && "bg-background text-foreground shadow-sm")}>
            <LayoutList className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">List</span>
          </Button>
        </div>
        {/* [END OF CHANGE] */}

        {onExportAction && (
          <Button variant="outline" size="sm" className="h-10" onClick={onExportAction}>
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}

        {viewMode === "list" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 w-full sm:w-auto">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllColumns().filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
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
