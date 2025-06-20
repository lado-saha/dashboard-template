"use client";

import { DataGrid } from "@/components/ui/data-grid";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import {
  PracticalInformationDto,
  CreatePracticalInformationRequest,
  UpdatePracticalInformationRequest,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";

import { PracticalInfoForm } from "@/components/organization/practical-info/practical-info-form";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { PracticalInfoCard } from "@/components/organization/practical-info/practical-info-card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  LayoutList,
  LayoutGrid,
  Loader2,
  AlertTriangle,
  Inbox,
  FileText,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { getPracticalInfoColumns } from "@/components/organization/practical-info/columns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { DataTableFilterOption } from "@/types/table";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { ViewMode } from "@/types/common";

const getPracticalInfoTypeOptions = (
  items: PracticalInformationDto[]
): DataTableFilterOption[] => {
  const allTypes = items.map((item) => item.type);
  // 2. Use a Set to get unique values, then filter out any falsy values (null, undefined, "")
  const uniqueValidTypes = [...new Set(allTypes)].filter(Boolean);

  // 3. Map the guaranteed strings to the required format and sort
  return uniqueValidTypes
    .map((type) => ({
      label: String(type),
      value: String(type),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

const fuzzyGlobalFilterFn: FilterFn<PracticalInformationDto> = (
  row,
  columnId,
  value,
  addMeta
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank } as any);
  return itemRank.passed;
};

export default function ManagePracticalInfoPage() {
  const {
    activeOrganizationId,
    activeOrganizationDetails,
    isLoadingOrgDetails,
  } = useActiveOrganization();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingItem, setEditingItem] = useState<
    PracticalInformationDto | undefined
  >(undefined);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [allItems, setAllItems] = useState<PracticalInformationDto[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0); // For triggering refetch

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilterAction] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const derivedTypeOptions = useMemo(
    () => getPracticalInfoTypeOptions(allItems),
    [allItems]
  );

  const fetchData = useCallback(async () => {
    // We must have an organization ID to fetch data.
    if (!activeOrganizationId) {
      setIsItemsLoading(false);
      return;
    }

    setIsItemsLoading(true);
    setItemsError(null);
    try {
      const data = await organizationRepository.getPracticalInformation(
        activeOrganizationId
      );
      setAllItems(data || []);
    } catch (err: any) {
      const errorMessage =
        err.message || "Could not load practical information.";
      setItemsError(errorMessage);
      toast.error(errorMessage);
      setAllItems([]);
    } finally {
      setIsItemsLoading(false);
    }
  }, [activeOrganizationId]); // It only depends on the activeOrganizationId

  useEffect(() => {
    fetchData();
  }, [fetchData, dataVersion]);

  const handleFormSubmitAttempt = async (
    data: CreatePracticalInformationRequest | UpdatePracticalInformationRequest,
    infoId?: string
  ): Promise<boolean> => {
    if (!activeOrganizationId) {
      toast.error("No active organization selected.");
      return false;
    }
    try {
      if (infoId) {
        // Edit mode
        await organizationRepository.updatePracticalInformation(
          activeOrganizationId,
          infoId,
          data as UpdatePracticalInformationRequest
        );
        toast.success("Practical information updated successfully!");
      } else {
        // Create mode
        await organizationRepository.createPracticalInformation(
          activeOrganizationId,
          data as CreatePracticalInformationRequest
        );
        toast.success("Practical information added successfully!");
      }
      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to save practical information.");
      return false;
    }
  };

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  const handleOpenFormModal = (item?: PracticalInformationDto) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteSelected = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const numSelected = selectedRows.length;

    if (numSelected === 0) {
      toast.info("No items selected to delete.");
      return;
    }

    const itemIdsToDelete = selectedRows.map(
      (row) => row.original.information_id!
    );
    const itemTypes = selectedRows
      .map((row) => `"${row.original.type}"`)
      .slice(0, 3) // Show up to 3 for readability
      .join(", ");

    // Confirmation dialog for safety
    if (
      !confirm(
        `Are you sure you want to delete ${numSelected} item(s)?\n(${itemTypes}${
          numSelected > 3 ? "..." : ""
        })\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // NOTE: Ideally, the repository would have a batch delete method.
      // For now, we can loop, but a single API call is better for performance.
      await Promise.all(
        itemIdsToDelete.map((id) =>
          organizationRepository.deletePracticalInformation(
            activeOrganizationId!,
            id
          )
        )
      );

      toast.success(`${numSelected} item(s) deleted successfully.`);
      refreshData(); // Your existing function to refetch data
      table.resetRowSelection(); // Clear selection after action
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${numSelected} item(s).`);
    }
  };

  const handleDeleteItem = useCallback(
    async (item: PracticalInformationDto) => {
      if (!activeOrganizationId) {
        toast.error("No active organization selected.");
        return;
      }
      if (
        !item.information_id ||
        !confirm(
          `Delete "${item.type || "this item"}"? This action cannot be undone.`
        )
      )
        return;

      try {
        await organizationRepository.deletePracticalInformation(
          activeOrganizationId,
          item.information_id
        );
        toast.success("Practical information deleted.");
        refreshData();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete information.");
      }
    },
    [activeOrganizationId, refreshData]
  );

  const columns = useMemo<ColumnDef<PracticalInformationDto>[]>(
    () =>
      getPracticalInfoColumns({
        onEditAction: handleOpenFormModal,
        onDeleteAction: handleDeleteItem,
      }),
    [handleDeleteItem]
  );

  const table = useReactTable({
    data: allItems,
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
    globalFilterFn: fuzzyGlobalFilterFn,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
    enableRowSelection: true,
  });

  useEffect(() => {
    table.setPageSize(10);
  }, [viewMode, table]);

  const currentTablePageRows: Row<PracticalInformationDto>[] =
    table.getRowModel().rows;

  if (isLoadingOrgDetails) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!activeOrganizationId) {
    return (
      <div className="p-6 text-center text-muted-foreground border rounded-lg min-h-[400px] flex flex-col justify-center items-center">
        <Inbox className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold">No Organization Selected</h3>
        <p>
          Please select an organization from the sidebar or dashboard to manage
          its practical information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Practical Information
              </h1>
              <p className="text-muted-foreground">
                Manage important operational details for{" "}
                {activeOrganizationDetails?.short_name}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-x-2 flex-shrink-0">
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
              onClick={() => handleOpenFormModal()}
              size="sm"
              className="h-10"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </div>
        </div>
      </header>
      <Card>
        <CardContent className="space-y-6">
          <DataTableToolbar<PracticalInformationDto>
            table={table}
            viewMode={viewMode}
            globalFilter={globalFilter}
            onGlobalFilterChangeAction={setGlobalFilterAction}
            searchPlaceholder="Search by type, value, notes..."
            filterControls={
              table.getColumn("type") && derivedTypeOptions.length > 0 ? (
                <DataTableFacetedFilter
                  column={table.getColumn("type")}
                  title="Type"
                  options={derivedTypeOptions}
                />
              ) : null
            }
            bulkActions={
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="h-9"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            }
          />
          <main>
            {isItemsLoading &&
              (viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="h-[180px]">
                      <CardHeader>
                        <Skeleton className="h-5 w-3/5" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5 mt-2" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-6 w-16 ml-auto" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="p-4 border-b">
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                  <div className="divide-y">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-4">
                        <Skeleton className="h-8 w-8" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {!isItemsLoading && itemsError /* Error Display */ && (
              <div className="min-h-[200px] flex flex-col justify-center items-center p-6 border border-destructive/50 bg-destructive/10 rounded-lg text-center">
                <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
                <p className="text-destructive-foreground font-medium">
                  {itemsError}
                </p>
                <Button
                  onClick={refreshData}
                  variant="destructive"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            )}
            {!isItemsLoading &&
              !itemsError &&
              table.getRowModel().rows.length === 0 &&
              (allItems.length > 0 ||
                globalFilter ||
                columnFilters.length > 0) /* Filtered to empty */ && (
                <div className="min-h-[200px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-lg p-6">
                  <Search className="h-12 w-12 text-muted-foreground/70 mb-4" />
                  <h3 className="text-lg font-semibold">
                    No Information Matches Filters
                  </h3>
                  <p className="text-sm">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGlobalFilterAction("");
                      table.resetColumnFilters();
                    }}
                    className="mt-3"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            {!isItemsLoading &&
              !itemsError &&
              allItems.length === 0 &&
              !globalFilter &&
              columnFilters.length === 0 /* Truly no items */ && (
                <div className="min-h-[200px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-lg p-6">
                  <Inbox className="h-12 w-12 text-muted-foreground/70 mb-4" />
                  <h3 className="text-lg font-semibold">
                    No Practical Information Added Yet
                  </h3>
                  <p className="text-sm">
                    Add important operational details for your organization.
                  </p>
                  <Button
                    onClick={() => handleOpenFormModal()}
                    className="mt-3"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Information
                  </Button>
                </div>
              )}

            {!isItemsLoading &&
              !itemsError &&
              table.getRowModel().rows.length > 0 &&
              (viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {currentTablePageRows.map((row) => (
                    <PracticalInfoCard
                      key={row.original.information_id}
                      item={row.original}
                      onEditAction={handleOpenFormModal}
                      onDeleteAction={handleDeleteItem}
                    />
                  ))}
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={allItems}
                  pageCount={table.getPageCount()}
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
                  manualPagination={false}
                  manualSorting={false}
                  manualFiltering={false}
                />
              ))}
            {!isItemsLoading && !itemsError && table.getPageCount() > 0 && (
              <div className="mt-6">
                <DataTablePagination table={table} viewMode={viewMode} />
              </div>
            )}
          </main>
        </CardContent>
      </Card>
      <Dialog
        open={isFormModalOpen}
        onOpenChange={(open) => {
          if (!open) setEditingItem(undefined);
          setIsFormModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? "Edit Practical Information"
                : "Add New Practical Information"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? `Update details for "${editingItem?.type}"`
                : "Provide details for the new piece of information."}
            </DialogDescription>
          </DialogHeader>
          <PracticalInfoForm
            organizationId={activeOrganizationId}
            initialData={editingItem}
            mode={editingItem ? "edit" : "create"}
            onSubmitAttempt={handleFormSubmitAttempt}
            onCancel={() => {
              setIsFormModalOpen(false);
              setEditingItem(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
