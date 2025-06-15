"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ProductListItemData } from "@/lib/types/product";
import { CustomerProductCard } from "@/components/customer/CustomerProductCard";
import { getCustomerProductColumns } from "@/components/customer/columns";
import { CustomerProductDataTableToolbar } from "@/components/customer/CustomerProductDataTableToolbar";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, LayoutGrid, LayoutList, Frown, ShoppingBag, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ColumnDef, SortingState, ColumnFiltersState, VisibilityState, PaginationState, RowSelectionState,
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, getFacetedRowModel, getFacetedUniqueValues, FilterFn, Table, Row
} from "@tanstack/react-table";
import { rankItem } from '@tanstack/match-sorter-utils';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { ReservationModal } from "@/components/customer/ReservationModal"; // Import ReservationModal

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
type ViewMode = "grid" | "list";

// Mock API call (Keep your existing mock data and fetch function here)
const fetchCustomerProducts = async (): Promise<ProductListItemData[]> => {
  console.log("Simulating API: Fetching ALL customer products for client-side filtering.");
  await new Promise(resolve => setTimeout(resolve, 600));
  const placeholderImageUrl = "";
  const mockData: ProductListItemData[] = [
    { id: "srv1", name: "Zen Garden Yoga Class (Single Session)", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 25, description: "Find your inner peace with our guided yoga session. Suitable for all levels.", imageUrl: placeholderImageUrl, baInfo: { id: "ba1", name: "Zenith Wellness", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: "res1", name: "Artisan Handcrafted Coffee Mug", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 35, description: "Beautifully handcrafted ceramic mug, perfect for your morning brew. Limited stock!", imageUrl: placeholderImageUrl, baInfo: { id: "ba2", name: "Crafty Corner", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "srv2", name: "Pro Photography Session (1 Hour)", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 150, description: "Capture your special moments with a professional 1-hour photo shoot. Includes 20 edited digital images.", imageUrl: placeholderImageUrl, baInfo: { id: "ba3", name: "Shutter Speed Inc.", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: "res2", name: "Organic Fruit Basket - Weekly", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 45, description: "Weekly subscription for a basket of fresh, seasonal organic fruits delivered to your doorstep.", imageUrl: placeholderImageUrl, baInfo: { id: "ba4", name: "FarmFresh Goods", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: "srv4", name: "Online Coding Bootcamp", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 499, description: "Intensive 12-week online coding bootcamp covering full-stack development.", imageUrl: placeholderImageUrl, baInfo: { id: "ba5", name: "CodeAcademy Plus", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "res3", name: "Premium Bluetooth Headphones", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 120, description: "High-fidelity sound with noise cancellation and long battery life.", imageUrl: placeholderImageUrl, baInfo: { id: "ba6", name: "AudioPhile Gear", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "srv5", name: "Home Cleaning Service (3 hours)", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 90, description: "Professional home cleaning service for up to 3 hours. All supplies included.", imageUrl: placeholderImageUrl, baInfo: { id: "ba7", name: "Sparkle Clean Co.", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: "res4", name: "Smart Home Security Camera", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 75, description: "1080p HD security camera with night vision and two-way audio.", imageUrl: placeholderImageUrl, baInfo: { id: "ba6", name: "AudioPhile Gear" }, createdAt: new Date(Date.now() - 86400000 * 18).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 6).toISOString() },
    { id: "srv6", name: "Graphic Design: Logo Package", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 250, description: "Custom logo design package with multiple concepts and revisions.", imageUrl: placeholderImageUrl, baInfo: { id: "ba8", name: "Creative Canvas Studio", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 25).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: "res5", name: "Portable Power Bank 20000mAh", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 40, description: "High-capacity power bank to keep your devices charged on the go.", imageUrl: placeholderImageUrl, baInfo: { id: "ba6", name: "AudioPhile Gear" }, createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: "srv7", name: "Personalized Nutrition Plan", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 60, description: "Diet plan created by a certified nutritionist based on your needs.", imageUrl: placeholderImageUrl, baInfo: { id: "ba1", name: "Zenith Wellness" }, createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: "res6", name: "Indoor Herb Garden Kit", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 30, description: "Grow your own fresh herbs indoors with this easy-to-use kit.", imageUrl: placeholderImageUrl, baInfo: { id: "ba4", name: "FarmFresh Goods" }, createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "srv8", name: "Virtual Assistant Services (10hr block)", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 200, description: "Delegate your tasks to a professional virtual assistant. 10 hours per month.", imageUrl: placeholderImageUrl, baInfo: { id: "ba9", name: "TaskMasters VA", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 40).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: "res7", name: "Adjustable Dumbbell Set", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 180, description: "Space-saving adjustable dumbbell set, perfect for home workouts.", imageUrl: placeholderImageUrl, baInfo: { id: "ba10", name: "HomeFit Gear", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: "srv9", name: "Language Tutoring: Spanish (1hr)", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 30, description: "Personalized Spanish language tutoring with a native speaker.", imageUrl: placeholderImageUrl, baInfo: { id: "ba11", name: "LinguaLearn", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 22).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "res8", name: "Professional Artist Paint Set", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 65, description: "High-quality acrylic paint set with a variety of brushes for artists.", imageUrl: placeholderImageUrl, baInfo: { id: "ba2", name: "Crafty Corner" }, createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: "srv10", name: "Career Coaching Session", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 120, description: "Guidance and strategies to advance your career and achieve professional goals.", imageUrl: placeholderImageUrl, baInfo: { id: "ba12", name: "Career Path Pro", logoUrl: "" }, createdAt: new Date(Date.now() - 86400000 * 35).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 8).toISOString() },
    { id: "res9", name: "Electric Gooseneck Kettle", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 50, description: "Precision pour electric kettle, ideal for coffee and tea enthusiasts.", imageUrl: placeholderImageUrl, baInfo: { id: "ba2", name: "Crafty Corner" }, createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: "srv11", name: "Custom Web Component Development", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 350, description: "Development of a bespoke web component tailored to your specific requirements.", imageUrl: placeholderImageUrl, baInfo: { id: "ba5", name: "CodeAcademy Plus" }, createdAt: new Date(Date.now() - 86400000 * 28).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 9).toISOString() },
    { id: "res10", name: "Yoga Mat - Eco Friendly", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 40, description: "Durable and eco-friendly yoga mat with excellent grip.", imageUrl: placeholderImageUrl, baInfo: { id: "ba1", name: "Zenith Wellness" }, createdAt: new Date(Date.now() - 86400000 * 11).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: "srv12", name: "Mobile App UI/UX Review", productType: "SERVICE", currentState: "PUBLISHED", basePrice: 180, description: "Expert review of your mobile app's UI/UX with actionable feedback.", imageUrl: placeholderImageUrl, baInfo: { id: "ba8", name: "Creative Canvas Studio" }, createdAt: new Date(Date.now() - 86400000 * 16).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 6).toISOString() },
    { id: "res11", name: "French Press Coffee Maker", productType: "RESOURCE", currentState: "AVAILABLE", basePrice: 28, description: "Classic French press for a rich and flavorful coffee experience.", imageUrl: placeholderImageUrl, baInfo: { id: "ba2", name: "Crafty Corner" }, createdAt: new Date(Date.now() - 86400000 * 9).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  ];
  return mockData;
};

const fuzzyGlobalFilterFn: FilterFn<ProductListItemData> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank } as any);
  return itemRank.passed;
};

export default function CustomerServicesPage() {
  const [allProducts, setAllProducts] = useState<ProductListItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 12 });

  const [selectedProductForDetail, setSelectedProductForDetail] = useState<ProductListItemData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedProductForReservation, setSelectedProductForReservation] = useState<ProductListItemData | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProducts = await fetchCustomerProducts();
      setAllProducts(fetchedProducts);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load products. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleViewDetails = useCallback((product: ProductListItemData) => {
    setSelectedProductForDetail(product);
    setIsDetailModalOpen(true);
  }, []);

  // This function will now open the ReservationModal
  const handleReserveOrEnquire = useCallback((product: ProductListItemData) => {
    setSelectedProductForReservation(product);
    setIsReservationModalOpen(true);
  }, []);

  const handleReservationSuccess = () => {
    // Potentially refresh data or show a more persistent success message
    // For now, ReservationModal handles its own toast.
    console.log("Reservation successful callback received.");
  };

  const columns = useMemo<ColumnDef<ProductListItemData>[]>(
    () => getCustomerProductColumns({ onViewDetails: handleViewDetails, onReserve: handleReserveOrEnquire }),
    [handleViewDetails, handleReserveOrEnquire] // Updated handler
  );

  const table = useReactTable({
    data: allProducts,
    columns,
    state: { sorting, columnFilters, globalFilter, columnVisibility, rowSelection, pagination },
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
    const newPageSize = viewMode === 'grid' ? 12 : 10;
    if (table.getState().pagination.pageSize !== newPageSize) {
      table.setPageSize(newPageSize);
    }
  }, [viewMode, table]);

  const currentTablePageRows: Row<ProductListItemData>[] = table.getRowModel().rows;

  return (
    <div className="container mx-auto py-6 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center">
              <ShoppingBag className="mr-3 h-7 w-7 text-primary flex-shrink-0" />
              Discover Services & Products
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Browse offerings from our trusted Business Actors.</p>
          </div>
          <div className="flex items-center gap-x-2 flex-shrink-0">
            <div className="flex items-center p-0.5 bg-muted rounded-md">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm"
                onClick={() => setViewMode('list')} aria-label="List view"
                className={cn("h-9 px-3 rounded-sm data-[state=active]:shadow-sm", viewMode === 'list' ? "bg-background text-foreground" : "text-muted-foreground hover:bg-background/50 hover:text-foreground")}
                data-state={viewMode === 'list' ? 'active' : 'inactive'}
              ><LayoutList className="h-4 w-4" /><span className="ml-1.5 hidden sm:inline">List</span></Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm"
                onClick={() => setViewMode('grid')} aria-label="Grid view"
                className={cn("h-9 px-3 rounded-sm data-[state=active]:shadow-sm", viewMode === 'grid' ? "bg-background text-foreground" : "text-muted-foreground hover:bg-background/50 hover:text-foreground")}
                data-state={viewMode === 'grid' ? 'active' : 'inactive'}
              ><LayoutGrid className="h-4 w-4" /><span className="ml-1.5 hidden sm:inline">Grid</span></Button>
            </div>
          </div>
        </div>
      </header>

      <CustomerProductDataTableToolbar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      <main className="mt-2">
        {/* ... Skeletons and Error/NoData states remain the same ... */}
        {isLoading && ( /* Skeletons Logic */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: table.getState().pagination.pageSize }).map((_, i) => (
                <Card key={i}><Skeleton className="aspect-[16/10] w-full rounded-t-lg" /><CardHeader className="pb-2 pt-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-1/2 mt-1.5" /></CardHeader><CardContent className="space-y-2 py-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /></CardContent><CardFooter className="pt-2 pb-3"><Skeleton className="h-8 w-full" /></CardFooter></Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="p-4 border-b"><Skeleton className="h-6 w-1/3" /></div>
              <div className="divide-y">
                {Array.from({ length: table.getState().pagination.pageSize }).map((_, i) =>
                  <div key={i} className="flex items-center gap-3 p-4">
                    <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
                    <div className="space-y-1.5 flex-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md ml-auto" />
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {!isLoading && error && ( /* Error Display */
          <div className="min-h-[300px] flex flex-col justify-center items-center p-10 border border-destructive/50 bg-destructive/10 rounded-lg text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" /><p className="text-destructive-foreground font-semibold">{error}</p>
            <Button onClick={loadProducts} variant="destructive" className="mt-6">Try Again</Button>
          </div>
        )}

        {!isLoading && !error && table.getRowModel().rows.length === 0 && allProducts.length > 0 && (
          <div className="min-h-[300px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-lg p-10">
            <Search className="h-16 w-16 text-muted-foreground/70 mb-6" />
            <h3 className="text-xl font-semibold">No Products Match Your Filters</h3>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria.</p>
            <Button variant="outline" onClick={() => { setGlobalFilter(""); table.resetColumnFilters(); }} className="mt-4">Clear Filters</Button>
          </div>
        )}
        {!isLoading && !error && allProducts.length === 0 && ( /* No products at all */
          <div className="min-h-[300px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-lg p-10">
            <Frown className="h-16 w-16 text-muted-foreground/70 mb-6" /><h3 className="text-xl font-semibold">No Products Available</h3>
            <p className="text-sm mt-1">Please check back later, or try a broader search.</p>
          </div>
        )}

        {!isLoading && !error && table.getRowModel().rows.length > 0 && (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {currentTablePageRows.map((row) => (
                <CustomerProductCard key={row.original.id} product={row.original} onViewDetailsClick={handleViewDetails} onReserveClick={handleReserveOrEnquire} />
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={allProducts}
              pageCount={table.getPageCount()}
              sorting={sorting} onSortingChange={setSorting}
              columnFilters={columnFilters} onColumnFiltersChange={setColumnFilters}
              globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter}
              columnVisibility={columnVisibility} onColumnVisibilityChange={setColumnVisibility}
              rowSelection={rowSelection} onRowSelectionChange={setRowSelection}
              pagination={pagination} onPaginationChange={setPagination}
              manualPagination={false} manualSorting={false} manualFiltering={false}
            />
          )
        )}

        {!isLoading && !error && table.getPageCount() > 0 && (
          <div className="mt-6">
            <DataTablePagination table={table} />
          </div>
        )}
      </main>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
          {selectedProductForDetail && (
            <ProductDetailView
              product={selectedProductForDetail}
              onClose={() => setIsDetailModalOpen(false)}
              showReserveButton={true} // Show reserve button in detail view
              onReserve={handleReserveOrEnquire} // Pass the handler
            // isBAView is false by default, so Edit button won't show
            />
          )}
        </DialogContent>
      </Dialog>

      <ReservationModal
        product={selectedProductForReservation}
        isOpen={isReservationModalOpen}
        onOpenChange={setIsReservationModalOpen}
        onReservationSuccess={handleReservationSuccess}
      />
    </div>
  );
}