"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
// ... (all other imports remain the same)
import { ProductForm } from "@/components/products/ProductForm";
import { ProductList } from "@/components/products/ProductList";
import { ProductGridView } from "@/components/products/ProductGridView";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { ProductDataTableToolbar } from "@/components/products/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Button } from "@/components/ui/button";
import { ProductListItemData } from "@/types/product";
import { ProductFormData } from "@/lib/validators/productValidator";
import {
  PlusCircle,
  ArrowLeft,
  LayoutList,
  LayoutGrid,
  Loader2,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { resourceApi, serviceApi } from "@/lib/apiClient";
import { toast } from "sonner";
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  RowSelectionState,
  Table as TanstackTableInstance,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  ColumnDef,
  FilterFn,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { cn } from "@/lib/utils"; // Import cn for conditional classes
import { getProductColumns } from "@/components/products/columns";

type PageMode = "list" | "create" | "edit" | "detail";
type ViewMode = "list" | "grid";

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



export default function ManageProductsPage() {
  const [pageMode, setPageMode] = useState<PageMode>("list");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeProductForForm, setActiveProductForForm] = useState<
    | Partial<
        Omit<ProductFormData, "scheduledAt"> & {
          id?: string;
          scheduledAt?: string | Date;
          productType?: "RESOURCE" | "SERVICE";
          currentState?: string;
        }
      >
    | undefined
  >(undefined);
  const [activeProductForDetail, setActiveProductForDetail] = useState<
    ProductListItemData | undefined
  >(undefined);
  const [allProducts, setAllProducts] = useState<ProductListItemData[]>([]);
  const [processedAndPaginatedProducts, setProcessedAndPaginatedProducts] =
    useState<ProductListItemData[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [itemActionLoading, setItemActionLoading] = useState<{
    [productId: string]: boolean;
  }>({});
  const [dataVersion, setDataVersion] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilterAction] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);
  const fetchAllProducts = useCallback(async () => {
    /* ... as before ... */
    setIsListLoading(true);
    setListError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const mockData: ProductListItemData[] = [
   
        {
          id: "res6",
          name: "Portable SSD 1TB",
          productType: "RESOURCE",
          currentState: "IN_USE",
          basePrice: 120.0,
          createdAt: new Date(now - 40 * dayMs).toISOString(),
          updatedAt: new Date(now - 10 * dayMs).toISOString(),
          description: "Fast and reliable portable solid state drive.",
        },
        {
          id: "srv7",
          name: "Social Media Management (Basic)",
          productType: "SERVICE",
          currentState: "ONGOING",
          basePrice: 250,
          createdAt: new Date(now - 25 * dayMs).toISOString(),
          updatedAt: new Date(now - 2 * dayMs).toISOString(),
          description: "Management of 2 social media platforms, 3 posts/week.",
        },
        {
          id: "res7",
          name: "USB-C Hub Multiport Adapter",
          productType: "RESOURCE",
          currentState: "FREE",
          basePrice: 45.5,
          createdAt: new Date(now - 8 * dayMs).toISOString(),
          updatedAt: new Date(now - 3 * dayMs).toISOString(),
          description: "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader.",
        },
        {
          id: "srv8",
          name: "Technical Writing Service (per page)",
          productType: "SERVICE",
          currentState: "PLANNED",
          basePrice: 75,
          createdAt: new Date(now - 12 * dayMs).toISOString(),
          updatedAt: new Date(now - 5 * dayMs).toISOString(),
          description: "Professional technical documentation writing.",
          isScheduled: true,
          scheduledAt: new Date(now + 10 * dayMs).toISOString(),
        },
        {
          id: "res8",
          name: "Office Plant - Snake Plant",
          productType: "RESOURCE",
          currentState: "AFFECTED",
          basePrice: 30.0,
          createdAt: new Date(now - 3 * dayMs).toISOString(),
          updatedAt: new Date(now - 1 * dayMs).toISOString(),
          description: "Low maintenance air-purifying office plant.",
        },
        {
          id: "srv9",
          name: "Custom Software Development (Hourly)",
          productType: "SERVICE",
          currentState: "PUBLISHED",
          basePrice: 120,
          createdAt: new Date(now - 50 * dayMs).toISOString(),
          updatedAt: new Date(now - 15 * dayMs).toISOString(),
          description: "Bespoke software solutions at an hourly rate.",
        },
        {
          id: "res9",
          name: "Noise-Cancelling Headphones",
          productType: "RESOURCE",
          currentState: "FREE",
          basePrice: 199.0,
          createdAt: new Date(now - 18 * dayMs).toISOString(),
          updatedAt: new Date(now - 7 * dayMs).toISOString(),
          description: "Over-ear headphones with active noise cancellation.",
        },
        {
          id: "srv10",
          name: "IT Support Ticket (Single Incident)",
          productType: "SERVICE",
          currentState: "FINISHED",
          basePrice: 80,
          createdAt: new Date(now - 35 * dayMs).toISOString(),
          updatedAt: new Date(now - 25 * dayMs).toISOString(),
          description: "Remote IT support for a single issue resolution.",
        },
        {
          id: "res10",
          name: "Monitor Arm - Single",
          productType: "RESOURCE",
          currentState: "IN_USE",
          basePrice: 65.0,
          createdAt: new Date(now - 22 * dayMs).toISOString(),
          updatedAt: new Date(now - 9 * dayMs).toISOString(),
          description: "Adjustable single monitor arm for ergonomic setup.",
        },
        {
          id: "srv11",
          name: "Online Course: Advanced JavaScript",
          productType: "SERVICE",
          currentState: "PUBLISHED",
          basePrice: 199,
          createdAt: new Date(now - 14 * dayMs).toISOString(),
          updatedAt: new Date(now - 4 * dayMs).toISOString(),
          description:
            "Comprehensive online course for advanced JS developers.",
        },
        {
          id: "res11",
          name: "Webcam HD 1080p",
          productType: "RESOURCE",
          currentState: "FREE",
          basePrice: 49.99,
          createdAt: new Date(now - 6 * dayMs).toISOString(),
          updatedAt: new Date(now - 2 * dayMs).toISOString(),
          description: "Full HD webcam with built-in microphone.",
        },
        {
          id: "srv12",
          name: "QuickBook Setup & Training",
          productType: "SERVICE",
          currentState: "PLANNED",
          basePrice: 300,
          createdAt: new Date(now - 4 * dayMs).toISOString(),
          updatedAt: new Date(now - 1 * dayMs).toISOString(),
          description:
            "QuickBooks Online setup and basic user training session.",
          isScheduled: true,
          scheduledAt: new Date(now + 12 * dayMs).toISOString(),
        },
      ];
      setAllProducts(mockData);
    } catch (err) {
      setListError("Could not load products.");
      toast.error("Could not load products.");
    } finally {
      setIsListLoading(false);
    }
  }, []);
  const handleViewProductDetails = useCallback(
    (product: ProductListItemData) => {
      setActiveProductForDetail(product);
      setPageMode("detail");
    },
    []
  );
  const handleCloseDetailViewAndGoToList = useCallback(() => {
    setPageMode("list");
    setActiveProductForDetail(undefined);
  }, []);
  const handleSwitchToCreateMode = useCallback(() => {
    setActiveProductForForm(undefined);
    setPageMode("create");
  }, []);
  const handleSwitchToListMode = useCallback(() => {
    setActiveProductForForm(undefined);
    setActiveProductForDetail(undefined);
    setPageMode("list");
  }, []);
  const handleDeleteProduct = useCallback(
    async (product: ProductListItemData) => {
      /* ... */
      if (!confirm(`Delete "${product.name}"?`)) return;
      setItemActionLoading((prev) => ({ ...prev, [product.id]: true }));
      try {
        if (product.productType === "RESOURCE")
          await resourceApi.delete(product.id);
        else await serviceApi.delete(product.id);
        toast.success(`"${product.name}" deleted.`);
        refreshData();
      } finally {
        setItemActionLoading((prev) => ({ ...prev, [product.id]: false }));
      }
    },
    [refreshData]
  );

  const handleChangeProductState = useCallback(
    async (product: ProductListItemData, newState: string) => {
      /* ... */
      if (
        !confirm(
          `Change state of "${product.name}" to ${newState.toUpperCase()}?`
        )
      )
        return;
      setItemActionLoading((prev) => ({ ...prev, [product.id]: true }));
      try {
        const payload = { currentState: newState.toUpperCase() };
        if (product.productType === "RESOURCE")
          await resourceApi.update(product.id, payload);
        else await serviceApi.update(product.id, payload);
        toast.success(`State changed to ${newState.toUpperCase()}.`);
        refreshData();
      } catch (error: any) {
        if (error.status === 409)
          toast.error(`Cannot change state: Transition not allowed.`);
      } finally {
        setItemActionLoading((prev) => ({ ...prev, [product.id]: false }));
      }
    },
    [refreshData]
  );

  const handleInitiateEdit = useCallback((product: ProductListItemData) => {
    const formDataForEdit: Partial<
      Omit<ProductFormData, "scheduledAt"> & {
        id?: string;
        scheduledAt?: string | Date;
      }
    > = {
      id: product.id,
      productType: product.productType,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      isScheduled: product.isScheduled,
      scheduledAt: product.scheduledAt,
      isCustomAction: (product as any).isCustomAction || false,
      customActionQuery: (product as any).customActionQuery || "",
    };
    setActiveProductForForm(formDataForEdit);
    setPageMode("edit");
  }, []);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts, dataVersion]);
  const columns = useMemo<ColumnDef<ProductListItemData>[]>(
    () =>
      getProductColumns({
        onEditAction: handleInitiateEdit,
        onDeleteAction: handleDeleteProduct,
        onChangeState: handleChangeProductState,
        onViewDetails: handleViewProductDetails,
        resourceStateTransitions,
        serviceStateTransitions,
        getIsItemActionLoading: (productId: string) =>
          !!itemActionLoading[productId],
      }),
    [
      handleInitiateEdit,
      handleDeleteProduct,
      handleChangeProductState,
      handleViewProductDetails,
      itemActionLoading,
    ]
  ); // Ensure all deps are here

  const table = useReactTable({
    data: allProducts,
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
    onGlobalFilterChange: setGlobalFilterAction,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: fuzzyGlobalFilterFn, // Corrected to pass the function itself
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
    pageCount,
  });

  useEffect(() => {
    /* ... client-side processing for processedAndPaginatedProducts ... */
    if (isListLoading) {
      setProcessedAndPaginatedProducts([]);
      return;
    }
    const sortedAndFilteredRowModel = table.getSortedRowModel();
    const currentViewRows = sortedAndFilteredRowModel.rows.map(
      (row) => row.original
    );
    const totalFilteredItems = table.getFilteredRowModel().rows.length;
    const calculatedPageCount = Math.ceil(
      totalFilteredItems / pagination.pageSize
    );
    setPageCount(calculatedPageCount);
    let currentPageIndex = pagination.pageIndex;
    if (pagination.pageIndex >= calculatedPageCount && calculatedPageCount > 0)
      currentPageIndex = calculatedPageCount - 1;
    else if (calculatedPageCount === 0) currentPageIndex = 0;
    if (currentPageIndex !== pagination.pageIndex)
      setPagination((p) => ({ ...p, pageIndex: currentPageIndex }));
    const pageStart = currentPageIndex * pagination.pageSize;
    setProcessedAndPaginatedProducts(
      currentViewRows.slice(pageStart, pageStart + pagination.pageSize)
    );
  }, [
    allProducts,
    globalFilter,
    columnFilters,
    sorting,
    pagination,
    table,
    isListLoading,
  ]);

  const handleFormSuccess = useCallback(() => {
    setPageMode("list");
    setActiveProductForForm(undefined);
    refreshData();
  }, [refreshData]);

  const pageTitle = useMemo(() => {
    /* ... */ return "Product Management";
  }, [pageMode, activeProductForForm, activeProductForDetail]);
  const pageDescription = useMemo(() => {
    /* ... */ return "Browse, filter...";
  }, [pageMode, activeProductForForm, activeProductForDetail]);

  const commonActionHandlersForChildren = {
    onEditAction: handleInitiateEdit,
    onDeleteAction: handleDeleteProduct,
    onChangeState: handleChangeProductState,
    onViewDetails: handleViewProductDetails,
    resourceStateTransitions,
    serviceStateTransitions,
    itemActionLoading,
  };

  const renderMainContent = () => {
    /* ... (same as before, no changes needed here) ... */
    if (pageMode === "create")
      return (
        <ProductForm
          mode="create"
          onFormSubmitSuccessAction={handleFormSuccess}
        />
      );
    if (pageMode === "edit" && activeProductForForm)
      return (
        <ProductForm
          mode="edit"
          initialData={activeProductForForm}
          onFormSubmitSuccessAction={handleFormSuccess}
        />
      );
    if (isListLoading && allProducts.length === 0) {
      /* ... skeleton ... */
      return (
        <div className="space-y-4 mt-4">
          {" "}
          <div className="flex justify-between">
            <Skeleton className="h-9 w-1/3" />
            <Skeleton className="h-9 w-1/4" />
          </div>{" "}
          <Skeleton className="h-[400px] w-full rounded-md" />{" "}
          <div className="flex justify-between">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>{" "}
        </div>
      );
    }
    if (listError) {
      /* ... error ... */
      return (
        <div className="mt-4 p-10 border border-destructive/50 bg-destructive/10 rounded-lg text-center">
          {" "}
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />{" "}
          <p className="text-destructive-foreground font-semibold">
            {listError}
          </p>{" "}
          <Button
            onClick={fetchAllProducts}
            variant="destructive"
            className="mt-6"
          >
            Try Again
          </Button>{" "}
        </div>
      );
    }
    if (viewMode === "grid") {
      return (
        <ProductGridView
          products={processedAndPaginatedProducts}
          isLoading={isListLoading && allProducts.length > 0}
          error={null}
          getActionLoadingState={(productId) => !!itemActionLoading[productId]}
          {...commonActionHandlersForChildren}
        />
      );
    }
    return (
      <ProductList
        data={processedAndPaginatedProducts}
        pageCount={pageCount}
        sorting={sorting}
        setSorting={setSorting}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        globalFilter={globalFilter}
        setGlobalFilterAction={setGlobalFilterAction}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        pagination={pagination}
        setPagination={setPagination}
        itemActionLoading={itemActionLoading}
        onEditProduct={handleInitiateEdit}
        onViewProductDetails={handleViewProductDetails}
        onDeleteProduct={handleDeleteProduct}
        onChangeProductState={handleChangeProductState}
      />
    );
  };

  return (
    <div className="container mx-auto py-6 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {pageTitle}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {pageDescription}
            </p>
          </div>
          <div className="flex items-center gap-x-2 flex-shrink-0">
            {" "}
            {pageMode === "list" && (
              <>
                {/* Segmented Control for View Mode */}
                <div className="flex items-center p-0.5 bg-muted rounded-md">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    aria-label="Switch to list view"
                    className={cn(
                      "h-8 px-3 rounded-sm data-[state=active]:shadow-sm",
                      viewMode === "list"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                    data-state={viewMode === "list" ? "active" : "inactive"}
                  >
                    <LayoutList className="h-4 w-4" />
                    <span className="ml-1.5 hidden sm:inline">List</span>
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    aria-label="Switch to grid view"
                    className={cn(
                      "h-8 px-3 rounded-sm data-[state=active]:shadow-sm",
                      viewMode === "grid"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                    data-state={viewMode === "grid" ? "active" : "inactive"}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="ml-1.5 hidden sm:inline">Grid</span>
                  </Button>
                </div>
                {/* End Segmented Control */}

                <Button
                  onClick={handleSwitchToCreateMode}
                  size="sm"
                  className="h-9"
                >
                  {" "}
                  {/* Matched height */}
                  <PlusCircle className="mr-2 h-4 w-4" /> New
                </Button>
              </>
            )}
            {(pageMode === "create" ||
              pageMode === "edit" ||
              pageMode === "detail") && (
              <Button
                variant="outline"
                onClick={handleSwitchToListMode}
                size="sm"
                className="h-9"
              >
                {" "}
                {/* Matched height */}
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        {pageMode === "list" && (
          <ProductDataTableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilterAction={setGlobalFilterAction}
          />
        )}
        {renderMainContent()}
        {pageMode === "list" &&
          !isListLoading &&
          !listError &&
          allProducts.length > 0 && <DataTablePagination table={table} />}
        {pageMode === "list" &&
          !isListLoading &&
          !listError &&
          allProducts.length === 0 &&
          !globalFilter &&
          columnFilters.length === 0 && (
            <div className="min-h-[200px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-md p-6 mt-4">
              <Inbox className="h-16 w-16 text-muted-foreground/70 mb-6" />
              <h3 className="text-lg font-semibold">
                Your Product Catalog is Empty
              </h3>
              <p className="text-sm">
                Get started by clicking the "Create New" button above.
              </p>
            </div>
          )}
      </main>

      {pageMode === "detail" && activeProductForDetail && (
        <ProductDetailView
          product={activeProductForDetail}
          onClose={handleCloseDetailViewAndGoToList}
          onEditAction={() => {
            if (activeProductForDetail)
              handleInitiateEdit(activeProductForDetail);
          }}
        />
      )}
    </div>
  );
}
