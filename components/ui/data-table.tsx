"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TanstackTableInstance,
  PaginationState,
  RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Extend props to accept an optional, pre-configured table instance
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number; // For server-side pagination, if tableInstance is not provided

  // Props for controlled state if tableInstance is NOT provided
  sorting?: SortingState;
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: React.Dispatch<
    React.SetStateAction<ColumnFiltersState>
  >;
  globalFilter?: string;
  onGlobalFilterChangeAction?: React.Dispatch<React.SetStateAction<string>>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: React.Dispatch<
    React.SetStateAction<VisibilityState>
  >;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: React.Dispatch<
    React.SetStateAction<RowSelectionState>
  >;
  pagination?: PaginationState;
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>;

  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;

  tableInstance?: TanstackTableInstance<TData>; // Optional pre-configured table instance
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount: parentPageCount,
  sorting: controlledSorting,
  onSortingChange,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChangeAction,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  pagination: controlledPagination,
  onPaginationChange,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  tableInstance, // Use this if provided
}: DataTableProps<TData, TValue>) {
  // Use the provided table instance, or create one if not provided
  const internalTable = useReactTable({
    data,
    columns,
    pageCount: parentPageCount ?? -1, // Use parentPageCount or default for internal calculation
    state: {
      sorting: controlledSorting,
      columnFilters: controlledColumnFilters,
      globalFilter: controlledGlobalFilter,
      columnVisibility: controlledColumnVisibility,
      rowSelection: controlledRowSelection,
      pagination: controlledPagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: onRowSelectionChange,
    onSortingChange: onSortingChange,
    onColumnFiltersChange: onColumnFiltersChange,
    onGlobalFilterChange: onGlobalFilterChangeAction,
    onColumnVisibilityChange: onColumnVisibilityChange,
    onPaginationChange: onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination,
    manualSorting,
    manualFiltering,
  });

  const table = tableInstance || internalTable; // Prioritize passed instance

  return (
    <div className="w-full space-y-0">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }} // Default size in tanstack table v8
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width:
                          cell.column.getSize() !== 150
                            ? cell.column.getSize()
                            : undefined,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
