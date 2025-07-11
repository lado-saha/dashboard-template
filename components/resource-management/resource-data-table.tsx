"use client";

import React, { useState, useMemo } from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  RowSelectionState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  Table,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataGrid } from "@/components/ui/data-grid";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ListViewSkeleton } from "@/components/ui/list-view-skeleton";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { AlertTriangle, Trash2, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fuzzyGlobalFilterFn } from "@/lib/utils";
import { ViewMode } from "@/types/common";
import { useLocalStorage } from "@/hooks/use-local-storage"; // [ADD] Import the new hook
import { exportToCsv } from "@/lib/export"; // [ADD] Import the export utility

interface ResourceDataTableProps<TData extends Record<string, any>, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  isLoading: boolean;
  error: string | null;
  onRefreshAction: () => void;
  pageHeader: React.ReactNode;
  filterControls?: (table: Table<TData>) => React.ReactNode;
  searchPlaceholder: string;
  emptyState: React.ReactNode;
  // [ADD] New prop for when filters result in no data
  filteredEmptyState?: React.ReactNode;
  renderGridItemAction: (item: TData) => React.ReactNode;
  onDeleteItemsAction: (items: TData[]) => void;
  // [ADD] Unique key for storing view mode preference
  viewModeStorageKey: string;
  // [ADD] Filename for the CSV export
  exportFileName: string;
}

export function ResourceDataTable<TData extends Record<string, any>, TValue>({
  data,
  columns,
  isLoading,
  error,
  onRefreshAction,
  pageHeader,
  filterControls,
  searchPlaceholder,
  emptyState,
  filteredEmptyState,
  renderGridItemAction,
  onDeleteItemsAction,
  viewModeStorageKey,
  exportFileName,
}: ResourceDataTableProps<TData, TValue>) {
  // [CHANGE] Use the local storage hook for viewMode
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    viewModeStorageKey,
    "list"
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: fuzzyGlobalFilterFn,
    enableRowSelection: true,
  });

  const handleExport = () => {
    exportToCsv(data, exportFileName);
  };

  const renderContent = () => {
    if (isLoading) return <ListViewSkeleton viewMode={viewMode} />;
    if (error) {
      return (
        <FeedbackCard
          variant="destructive"
          icon={AlertTriangle}
          title="Failed to Load Data"
          description={error}
          actionButton={<Button onClick={onRefreshAction}>Try Again</Button>}
        />
      );
    }
    // [CHANGE] Context-aware empty state logic
    const isFiltered = globalFilter || columnFilters.length > 0;
    if (table.getRowModel().rows.length === 0) {
      if (isFiltered && filteredEmptyState) {
        return filteredEmptyState;
      }
      return emptyState;
    }

    return viewMode === "grid" ? (
      <DataGrid
        table={table}
        renderCardAction={({ row }) => renderGridItemAction(row.original)}
      />
    ) : (
      <DataTable tableInstance={table} columns={columns} data={data} />
    );
  };

  return (
    <div className="space-y-6">
      {pageHeader}
      <Card>
        <CardContent className="pt-6">
          <DataTableToolbar
            table={table}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            globalFilter={globalFilter}
            onGlobalFilterChangeAction={setGlobalFilter}
            searchPlaceholder={searchPlaceholder}
            filterControls={filterControls ? filterControls(table) : null}
            onExportAction={handleExport} // Pass the export handler
            bulkActions={
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  onDeleteItemsAction(
                    table
                      .getFilteredSelectedRowModel()
                      .rows.map((r) => r.original)
                  )
                }
                className="h-9"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
            }
          />
          <main className="mt-4">{renderContent()}</main>
        </CardContent>
      </Card>
      {!isLoading && !error && table.getPageCount() > 1 && (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}
