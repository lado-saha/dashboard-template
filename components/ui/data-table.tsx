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
  Table as TanstackTable,
  PaginationState,
  RowSelectionState,
  GlobalFilterTableState, // Import this
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;

  sorting?: SortingState;
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: React.Dispatch<
    React.SetStateAction<ColumnFiltersState>
  >;
  globalFilter?: string; // Add globalFilter prop
  onGlobalFilterChange?: React.Dispatch<React.SetStateAction<string>>; // Add globalFilter setter
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
  setTable?: (table: TanstackTable<TData>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  sorting: controlledSorting,
  onSortingChange,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange, // Destructure global filter
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  pagination: controlledPagination,
  onPaginationChange,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  setTable: setParentTableInstance,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    []
  );
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [internalGlobalFilter, setInternalGlobalFilter] =
    React.useState<string>(""); // Internal global filter
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>({});
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const sorting = controlledSorting ?? internalSorting;
  const setSorting = onSortingChange ?? setInternalSorting;
  const columnFilters = controlledColumnFilters ?? internalColumnFilters;
  const setColumnFilters = onColumnFiltersChange ?? setInternalColumnFilters;
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter; // Use controlled or internal global filter
  const setGlobalFilter = onGlobalFilterChange ?? setInternalGlobalFilter; // Use controlled or internal setter
  const columnVisibility =
    controlledColumnVisibility ?? internalColumnVisibility;
  const setColumnVisibility =
    onColumnVisibilityChange ?? setInternalColumnVisibility;
  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const setRowSelection = onRowSelectionChange ?? setInternalRowSelection;
  const pagination = controlledPagination ?? internalPagination;
  const setPagination = onPaginationChange ?? setInternalPagination;

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter, // Pass globalFilter to table state
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter, // Handle global filter changes
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Enables global filtering
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination,
    manualSorting,
    manualFiltering,
  });

  React.useEffect(() => {
    if (setParentTableInstance) setParentTableInstance(table);
  }, [table, setParentTableInstance]);

  return (
    /* ... Table JSX (no changes needed here) ... */
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
                    }}
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
