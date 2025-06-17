"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation"; // Use for orgId from URL
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { ProductListItemData } from "@/types/product"; // Assuming this type is suitable for ResourceDto/ServiceDto list items
import {
  ProductFormData,
  fullProductFormSchema,
} from "@/lib/validators/productValidator"; // Re-use or adapt
import {
  resourceManagementApi, // For creating/fetching Resources/Services
  productStateApi, // For changing state of existing products (if separate from Resource Mgmt update)
} from "@/lib/apiClient";

import { ProductForm } from "@/components/products/ProductForm";
// ProductList and ProductGridView will now be primarily for display, data fetching in parent
import { ProductDataTableToolbar } from "@/components/products/data-table-toolbar";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ProductGridView } from "@/components/products/ProductGridView"; // For grid display
import { ProductDetailView } from "@/components/products/ProductDetailView"; // For detail modal

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  ArrowLeft,
  LayoutList,
  LayoutGrid,
  Loader2,
  AlertTriangle,
  Inbox,
  PackageSearch,
  Search,
} from "lucide-react";
import { toast } from "sonner";
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
  FilterFn,
  Row,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { cn } from "@/lib/utils";
import { getProductColumns } from "@/components/products/columns"; // Re-use or adapt BA product columns

// DTOs from Resource Management Service (assuming they map to ProductListItemData for now)
import {
  ResourceDto,
  ServiceDto,
  CreateResourceRequest,
  CreateServiceRequest,
  UpdateResourceRequest,
  UpdateServiceRequest,
} from "@/types/resourceManagement";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Link from "next/link";

type PageMode = "list" | "create" | "edit" | "detail";
type ViewMode = "list" | "grid";

// State transitions (from original Product Management Service spec)
// These might need to be adapted if Resource Management Service handles state differently
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

const fuzzyGlobalFilterFn: FilterFn<ProductListItemData> = (
  row,
  columnId,
  value,
  addMeta
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank } as any);
  return itemRank.passed;
};

export default function OrganizationProductsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const router = useRouter();
  const {
    activeOrganizationDetails,
    isLoadingOrgDetails: isLoadingActiveOrg,
    fetchActiveOrganizationDetails,
  } = useActiveOrganization();

  const [pageMode, setPageMode] = useState<PageMode>("list");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [activeProductForForm, setActiveProductForForm] = useState<
    | Partial<ProductFormData & { id?: string; currentState?: string }>
    | undefined
  >(undefined);
  const [activeProductForDetail, setActiveProductForDetail] = useState<
    ProductListItemData | undefined
  >(undefined);

  const [allOrgProducts, setAllOrgProducts] = useState<ProductListItemData[]>(
    []
  );
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [itemActionLoading, setItemActionLoading] = useState<{
    [productId: string]: boolean;
  }>({});
  const [dataVersion, setDataVersion] = useState(0); // For triggering refetch

  // TanStack Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Ensure active org details are loaded if not already
  useEffect(() => {
    if (orgId && !activeOrganizationDetails && !isLoadingActiveOrg) {
      fetchActiveOrganizationDetails(orgId);
    }
  }, [
    orgId,
    activeOrganizationDetails,
    isLoadingActiveOrg,
    fetchActiveOrganizationDetails,
  ]);

  const fetchOrganizationProducts = useCallback(async () => {
    if (!orgId) {
      setProductsError("Organization ID is missing.");
      setIsProductsLoading(false);
      return;
    }
    setIsProductsLoading(true);
    setProductsError(null);
    try {
      // MOCK API CALLS - Replace with actual resourceManagementApi calls
      await new Promise((resolve) => setTimeout(resolve, 700));
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      const mockResources: ProductListItemData[] = [
        {
          id: `res-${orgId}-1`,
          name: `Chair for ${activeOrganizationDetails?.short_name || orgId}`,
          productType: "RESOURCE",
          currentState: "FREE",
          basePrice: 199,
          createdAt: new Date(now - 5 * dayMs).toISOString(),
          updatedAt: new Date(now - 1 * dayMs).toISOString(),
          description: "Ergonomic chair available at this org.",
          baInfo: {
            id: orgId,
            name: activeOrganizationDetails?.short_name || "Org",
          },
        },
        {
          id: `res-${orgId}-2`,
          name: `Desk for ${activeOrganizationDetails?.short_name || orgId}`,
          productType: "RESOURCE",
          currentState: "AFFECTED",
          basePrice: 350,
          createdAt: new Date(now - 10 * dayMs).toISOString(),
          updatedAt: new Date(now - 2 * dayMs).toISOString(),
          description: "Spacious desk for this org.",
          baInfo: {
            id: orgId,
            name: activeOrganizationDetails?.short_name || "Org",
          },
        },
      ];
      const mockServices: ProductListItemData[] = [
        {
          id: `srv-${orgId}-1`,
          name: `Consulting by ${
            activeOrganizationDetails?.short_name || orgId
          }`,
          productType: "SERVICE",
          currentState: "PUBLISHED",
          basePrice: 250,
          createdAt: new Date(now - 20 * dayMs).toISOString(),
          updatedAt: new Date(now - 3 * dayMs).toISOString(),
          description: "Expert consulting services.",
          baInfo: {
            id: orgId,
            name: activeOrganizationDetails?.short_name || "Org",
          },
        },
      ];
      // In reality, you'd call:
      // const resources = await resourceManagementApi.getResources(orgId);
      // const services = await resourceManagementApi.getServices(orgId);
      // Then map DTOs to ProductListItemData if necessary
      setAllOrgProducts([...mockResources, ...mockServices]);
    } catch (err: any) {
      setProductsError(
        err.message || "Could not load products for this organization."
      );
      toast.error(err.message || "Could not load products.");
      setAllOrgProducts([]);
    } finally {
      setIsProductsLoading(false);
    }
  }, [orgId, activeOrganizationDetails?.short_name]); // Dependency on orgId ensures refetch if it changes

  useEffect(() => {
    if (orgId) {
      // Only fetch if orgId is available
      fetchOrganizationProducts();
    }
  }, [fetchOrganizationProducts, dataVersion, orgId]); // Re-fetch if orgId or dataVersion changes

  const refreshProducts = useCallback(() => setDataVersion((v) => v + 1), []);

  const handleFormSuccess = useCallback(() => {
    setPageMode("list");
    setActiveProductForForm(undefined);
    refreshProducts();
  }, [refreshProducts]);

  const handleSwitchToCreateMode = useCallback(() => {
    setActiveProductForForm({}); // Start with empty form for create
    setPageMode("create");
  }, []);

  const handleSwitchToListMode = useCallback(() => {
    setActiveProductForForm(undefined);
    setActiveProductForDetail(undefined);
    setPageMode("list");
  }, []);

  const handleViewProductDetails = useCallback(
    (product: ProductListItemData) => {
      setActiveProductForDetail(product);
      setPageMode("detail");
    },
    []
  );

  const handleCloseDetailView = useCallback(() => {
    setPageMode("list");
    setActiveProductForDetail(undefined);
  }, []);

  const handleInitiateEdit = useCallback((product: ProductListItemData) => {
    // Map ProductListItemData to ProductFormData. This might need adjustments.
    const formData: Partial<
      ProductFormData & { id?: string; currentState?: string }
    > = {
      id: product.id,
      productType: product.productType,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      currentState: product.currentState, // Pass current state for context in form if needed
      isScheduled: product.isScheduled,
      scheduledAt: product.scheduledAt
        ? new Date(product.scheduledAt)
        : undefined,
      // ... map other fields if your ProductForm expects them from ProductListItemData
    };
    setActiveProductForForm(formData);
    setPageMode("edit");
  }, []);

  const handleDeleteProduct = useCallback(
    async (product: ProductListItemData) => {
      if (
        !orgId ||
        !product.id ||
        !confirm(`Are you sure you want to delete "${product.name}"?`)
      )
        return;
      setItemActionLoading((prev) => ({ ...prev, [product.id!]: true }));
      try {
        if (product.productType === "RESOURCE") {
          // await resourceManagementApi.deleteResource(orgId, product.id); // REAL API
        } else {
          // await resourceManagementApi.deleteService(orgId, product.id); // REAL API
        }
        await new Promise((r) => setTimeout(r, 500)); // MOCK
        toast.success(`"${product.name}" deleted successfully.`);
        refreshProducts();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete product.");
      } finally {
        setItemActionLoading((prev) => ({ ...prev, [product.id!]: false }));
      }
    },
    [orgId, refreshProducts]
  );

  const handleChangeProductState = useCallback(
    async (product: ProductListItemData, newState: string) => {
      if (
        !product.id ||
        !confirm(
          `Change state of "${product.name}" to ${newState.toUpperCase()}?`
        )
      )
        return;
      setItemActionLoading((prev) => ({ ...prev, [product.id!]: true }));
      try {
        const payload = { currentState: newState.toUpperCase() };
        // Use productStateApi or resourceManagementApi update endpoint if state is part of its DTO
        if (product.productType === "RESOURCE") {
          // await productStateApi.updateResourceState(product.id, payload); // REAL API
        } else {
          // await productStateApi.updateServiceState(product.id, payload); // REAL API
        }
        await new Promise((r) => setTimeout(r, 500)); // MOCK
        toast.success(
          `State for "${product.name}" changed to ${newState.toUpperCase()}.`
        );
        refreshProducts();
      } catch (error: any) {
        const errorMessage =
          (error as any).status === 409
            ? "State transition not allowed."
            : error.message || "Failed to change product state.";
        toast.error(errorMessage);
      } finally {
        setItemActionLoading((prev) => ({ ...prev, [product.id!]: false }));
      }
    },
    [refreshProducts]
  );

  const columns = useMemo<ColumnDef<ProductListItemData>[]>(
    () =>
      getProductColumns({
        onEdit: handleInitiateEdit,
        onDelete: handleDeleteProduct,
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
  );

  const table = useReactTable({
    data: allOrgProducts,
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
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
    enableRowSelection: true,
  });

  useEffect(() => {
    const newPageSize = viewMode === "grid" ? 12 : 10;
    if (table.getState().pagination.pageSize !== newPageSize) {
      table.setPageSize(newPageSize);
    }
  }, [viewMode, table]);

  const currentTablePageRows: Row<ProductListItemData>[] =
    table.getRowModel().rows;

  if (isLoadingActiveOrg && !activeOrganizationDetails) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-1/2 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!orgId || (!isLoadingActiveOrg && !activeOrganizationDetails)) {
    return (
      <div className="container mx-auto py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Organization Not Selected
        </h2>
        <p className="text-muted-foreground mb-4">
          Please select an active organization from the dashboard to manage its
          products.
        </p>
        <Button asChild>
          <Link href="/business-actor/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const renderMainContent = () => {
    if (
      pageMode === "create" ||
      (pageMode === "edit" && activeProductForForm)
    ) {
      return (
        <ProductForm
          mode={pageMode as "create" | "edit"}
          initialData={activeProductForForm}
          onFormSubmitSuccess={handleFormSuccess}
          // Pass organizationId for API calls within ProductForm
          // organizationId={orgId}
        />
      );
    }

    if (isProductsLoading && allOrgProducts.length === 0) {
      return viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: table.getState().pagination.pageSize }).map(
            (_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-[16/10] w-full rounded-t-lg" />
                <CardHeader className="pb-2 pt-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2 mt-1.5" />
                </CardHeader>
                <CardContent className="space-y-2 py-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </CardContent>
                <CardFooter className="pt-2 pb-3">
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            )
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-1/3" />
          </div>
          <div className="divide-y">
            {Array.from({ length: table.getState().pagination.pageSize }).map(
              (_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-24 rounded-md ml-auto" />
                </div>
              )
            )}
          </div>
        </div>
      );
    }
    if (productsError) {
      return (
        <div className="mt-4 p-10 border border-destructive/50 bg-destructive/10 rounded-lg text-center">
          {" "}
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />{" "}
          <p className="text-destructive-foreground font-semibold">
            {productsError}
          </p>{" "}
          <Button
            onClick={refreshProducts}
            variant="destructive"
            className="mt-6"
          >
            Try Again
          </Button>{" "}
        </div>
      );
    }
    if (table.getRowModel().rows.length === 0 && allOrgProducts.length > 0) {
      // Filtered to empty
      return (
        <div className="min-h-[200px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-md p-6 mt-4">
          <Search className="h-16 w-16 text-muted-foreground/70 mb-6" />
          <h3 className="text-lg font-semibold">
            No Products Match Your Filters
          </h3>
          <p className="text-sm">
            Try adjusting your search or filter criteria.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setGlobalFilter("");
              table.resetColumnFilters();
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      );
    }
    if (allOrgProducts.length === 0) {
      // Truly no products
      return (
        <div className="min-h-[200px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-md p-6 mt-4">
          <PackageSearch className="h-16 w-16 text-muted-foreground/70 mb-6" />
          <h3 className="text-lg font-semibold">No Products Yet</h3>
          <p className="text-sm">
            This organization hasn't added any products or services.
          </p>
          <Button onClick={handleSwitchToCreateMode} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add First Product
          </Button>
        </div>
      );
    }

    // Display logic
    if (viewMode === "grid") {
      return (
        <ProductGridView
          products={currentTablePageRows.map((row) => row.original)}
          isLoading={isProductsLoading && allOrgProducts.length > 0} // Pass refined loading
          error={null}
          getActionLoadingState={(productId) => !!itemActionLoading[productId]}
          onEdit={handleInitiateEdit}
          onDelete={handleDeleteProduct}
          onChangeState={handleChangeProductState}
          onViewDetails={handleViewProductDetails}
          resourceStateTransitions={resourceStateTransitions}
          serviceStateTransitions={serviceStateTransitions}
        />
      );
    }
    return (
      <DataTable
        columns={columns}
        data={allOrgProducts}
        pageCount={table.getPageCount()}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        pagination={pagination}
        onPaginationChange={setPagination}
        manualPagination={false}
        manualSorting={false}
        manualFiltering={false}
      />
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Manage Products & Services
            </h2>
            <p className="text-sm text-muted-foreground">
              Create, view, and manage resources and services for{" "}
              {activeOrganizationDetails?.short_name || "this organization"}.
            </p>
          </div>
          <div className="flex items-center gap-x-2 flex-shrink-0">
            {pageMode === "list" && (
              <>
                <div className="flex items-center p-0.5 bg-muted rounded-md">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-9 px-3",
                      viewMode === "list" &&
                        "bg-background text-foreground shadow-sm"
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
                    className={cn(
                      "h-9 px-3",
                      viewMode === "grid" &&
                        "bg-background text-foreground shadow-sm"
                    )}
                    data-state={viewMode === "grid" ? "active" : "inactive"}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="ml-1.5 hidden sm:inline">Grid</span>
                  </Button>
                </div>
                <Button
                  onClick={handleSwitchToCreateMode}
                  size="sm"
                  className="h-10"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> New Product
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
                className="h-10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
              </Button>
            )}
          </div>
        </div>
      </header>
      {/* Toolbar only for list mode or when not creating/editing */}
      {pageMode === "list" && (
        <ProductDataTableToolbar
          table={table} // Pass the table instance here
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      )}
      <main>
        {renderMainContent()}
        {/* Pagination outside renderMainContent, controlled by pageMode and data availability */}
        {viewMode === "list" &&
          !isProductsLoading &&
          !productsError &&
          allOrgProducts.length > 0 &&
          table.getPageCount() > 0 && <DataTablePagination table={table} />}
        {viewMode === "grid" &&
          !isProductsLoading &&
          !productsError &&
          allOrgProducts.length > 0 &&
          table.getPageCount() > 0 && (
            <div className="mt-6">
              <DataTablePagination table={table} />
            </div>
          )}
      </main>
      {/* Detail View Modal (remains the same) */}
      {pageMode === "detail" && activeProductForDetail && (
        <Dialog
          open={pageMode === "detail"}
          onOpenChange={(open) => !open && handleCloseDetailView()}
        >
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
            <ProductDetailView
              product={activeProductForDetail}
              onClose={handleCloseDetailView}
              onEdit={() =>
                activeProductForDetail &&
                handleInitiateEdit(activeProductForDetail)
              }
              isBAView={true} // This is the BA's view of their own product
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
