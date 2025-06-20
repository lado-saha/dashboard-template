"use client";

import React, { useMemo } from "react";
import { ProductListItemData } from "@/types/product";
import { getProductColumns, ProductRowActionsProps } from "./columns";
import { DataTable } from "@/components/ui/data-table";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  Table as TanstackTableInstance,
  PaginationState,
  RowSelectionState,
} from "@tanstack/react-table";

interface ProductListProps {
  data: ProductListItemData[]; // Data is now always the processed & paginated slice
  pageCount: number;
  // isLoading prop is removed

  onEditProduct: (product: ProductListItemData) => void;
  onViewProductDetails: (product: ProductListItemData) => void;
  onDeleteProduct: (product: ProductListItemData) => void;
  onChangeProductState: (
    product: ProductListItemData,
    newState: string
  ) => void;

  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  globalFilter: string;
  setGlobalFilterAction: React.Dispatch<React.SetStateAction<string>>;
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;

  // setTableInstance prop can be removed if parent ManageProductsPage creates the primary table instance
  // setTableInstance: (table: TanstackTableInstance<ProductListItemData> | null) => void;
  itemActionLoading: { [productId: string]: boolean };
}

const resourceStateTransitions: Record<string, string[]> = {
  FREE: ["AFFECTED"],
  AFFECTED: ["FREE", "IN_USE"],
  IN_USE: ["FREE"],
};
const serviceStateTransitions: Record<string, string[]> = {
  PLANNED: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["PLANNED", "ONGOING", "CANCELLED"],
  ONGOING: ["FINISHED"],
  FINISHED: [],
  CANCELLED: [],
};

export function ProductList({
  data,
  pageCount,
  onEditProduct,
  onViewProductDetails,
  onDeleteProduct,
  onChangeProductState,
  sorting,
  setSorting,
  columnFilters,
  setColumnFilters,
  globalFilter,
  setGlobalFilterAction,
  columnVisibility,
  setColumnVisibility,
  rowSelection,
  setRowSelection,
  pagination,
  setPagination,
  itemActionLoading,
}: ProductListProps) {
  const columns = useMemo<ColumnDef<ProductListItemData>[]>(
    () =>
      getProductColumns({
        onEditAction: onEditProduct,
        onDeleteAction: onDeleteProduct,
        onChangeState: onChangeProductState,
        onViewDetails: onViewProductDetails,
        resourceStateTransitions,
        serviceStateTransitions,
        getIsItemActionLoading: (productId: string) =>
          !!itemActionLoading[productId],
      }),
    [
      onEditProduct,
      onDeleteProduct,
      onChangeProductState,
      onViewProductDetails,
      itemActionLoading,
    ]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      pageCount={pageCount}
      sorting={sorting}
      onSortingChange={setSorting}
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      globalFilter={globalFilter}
      onGlobalFilterChangeAction={setGlobalFilterAction}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      pagination={pagination}
      onPaginationChange={setPagination}
      // If ManageProductsPage is doing all filtering/sorting/pagination on allProducts
      // and ProductList just displays a slice, then these should be false
      // because the `data` prop is already the "final" data for the current page.
      // TanStack Table would then only sort/filter THIS current page of data if these are false.
      // For consistency with how ManageProductsPage is now set up to leverage the table instance for filtering:
      manualPagination={true} // Parent sends paginated data
      manualSorting={true} // Parent sends sorted data (based on table state)
      manualFiltering={true} // Parent sends filtered data (based on table state)
      // setTable is used by ManageProductsPage for its primary table instance
    />
  );
}
