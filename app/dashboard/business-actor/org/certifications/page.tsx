"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import {
  CertificationDto,
  CreateCertificationRequest,
  UpdateCertificationRequest,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { CertificationForm } from "@/components/organization/certifications/certification-form";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { CertificationCard } from "@/components/organization/certifications/certification-card";
import { DataGrid } from "@/components/ui/data-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  LayoutList,
  LayoutGrid,
  Loader2,
  AlertTriangle,
  Inbox,
  Search,
  Trash2,
  Award,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { getCertificationColumns } from "@/components/organization/certifications/columns";
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
import { ListViewSkeleton } from "@/components/ui/list-view-skeleton";

const getCertificationTypeOptions = (
  items: CertificationDto[]
): DataTableFilterOption[] => {
  const allTypes = items.map((item) => item.type);
  const uniqueValidTypes = [...new Set(allTypes)].filter(Boolean);
  return uniqueValidTypes
    .map((type) => ({
      label: String(type),
      value: String(type),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

const fuzzyGlobalFilterFn: FilterFn<CertificationDto> = (
  row,
  columnId,
  value,
  addMeta
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank } as any);
  return itemRank.passed;
};

export default function ManageCertificationsPage() {
  const {
    activeOrganizationId,
    activeOrganizationDetails,
    isLoadingOrgDetails,
  } = useActiveOrganization();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingItem, setEditingItem] = useState<CertificationDto | undefined>(
    undefined
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<CertificationDto[]>([]);

  const [allItems, setAllItems] = useState<CertificationDto[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
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

  const derivedTypeOptions = useMemo(
    () => getCertificationTypeOptions(allItems),
    [allItems]
  );

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsItemsLoading(false);
      return;
    }
    setIsItemsLoading(true);
    setItemsError(null);
    try {
      const data = await organizationRepository.getCertifications(
        activeOrganizationId
      );
      setAllItems(data || []);
    } catch (err: any) {
      const errorMessage = err.message || "Could not load certifications.";
      setItemsError(errorMessage);
      toast.error(errorMessage);
      setAllItems([]);
    } finally {
      setIsItemsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, dataVersion]);

  const handleFormSubmitAttempt = async (
    data: CreateCertificationRequest | UpdateCertificationRequest,
    certId?: string
  ): Promise<boolean> => {
    if (!activeOrganizationId) {
      toast.error("No active organization selected.");
      return false;
    }
    try {
      if (certId) {
        await organizationRepository.updateCertification(
          activeOrganizationId,
          certId,
          data as UpdateCertificationRequest
        );
        toast.success("Certification updated successfully!");
      } else {
        await organizationRepository.createCertification(
          activeOrganizationId,
          data as CreateCertificationRequest
        );
        toast.success("Certification added successfully!");
      }
      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error: any)  {
      toast.error(error.message || "Failed to save certification.");
      return false;
    }
  };

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  const handleOpenFormModal = (item?: CertificationDto) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: CertificationDto[]) => {
    if (items.length === 0) {
      toast.info("No items selected to delete.");
      return;
    }
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    try {
      await Promise.all(
        itemsToDelete.map((item) =>
          organizationRepository.deleteCertification(
            activeOrganizationId,
            item.certification_id!
          )
        )
      );
      toast.success(
        `${itemsToDelete.length} certification(s) deleted successfully.`
      );
      refreshData();
      table.resetRowSelection();
    } catch (error: any)  {
      toast.error(error.message || `Failed to delete items.`);
    } finally {
      setIsDeleteDialogOpen(false);
      setItemsToDelete([]);
    }
  };

  const columns = useMemo<ColumnDef<CertificationDto>[]>(
    () =>
      getCertificationColumns({
        onEditAction: handleOpenFormModal,
        onDeleteAction: (item) => handleDeleteConfirmation([item]),
      }),
    []
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

  const currentTablePageRows: Row<CertificationDto>[] =
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
        <p>Select an organization to manage its certifications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Certifications
            </h1>
            <p className="text-muted-foreground">
              Manage awards and certifications for{" "}
              <b>{activeOrganizationDetails?.long_name}</b>
            </p>
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
          <DataTableToolbar<CertificationDto>
            table={table}
            viewMode={viewMode}
            globalFilter={globalFilter}
            onGlobalFilterChangeAction={setGlobalFilterAction}
            searchPlaceholder="Search by name, type..."
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
                onClick={() =>
                  handleDeleteConfirmation(
                    table
                      .getFilteredSelectedRowModel()
                      .rows.map((row) => row.original)
                  )
                }
                className="h-9"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
              </Button>
            }
          />
          <main>
            {isItemsLoading && <ListViewSkeleton viewMode={viewMode} />}

            {!isItemsLoading && itemsError && (
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
                columnFilters.length > 0) && (
                <div className="min-h-[200px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-lg p-6">
                  <Search className="h-12 w-12 text-muted-foreground/70 mb-4" />
                  <h3 className="text-lg font-semibold">
                    No Certifications Match Filters
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
              columnFilters.length === 0 && (
                <div className="min-h-[200px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-lg p-6">
                  <Award className="h-12 w-12 text-muted-foreground/70 mb-4" />
                  <h3 className="text-lg font-semibold">
                    No Certifications Added Yet
                  </h3>
                  <p className="text-sm">
                    Add your organization&apos;n awards and certifications.
                  </p>
                  <Button
                    onClick={() => handleOpenFormModal()}
                    className="mt-3"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Certification
                  </Button>
                </div>
              )}
            {!isItemsLoading &&
              !itemsError &&
              table.getRowModel().rows.length > 0 &&
              (viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {currentTablePageRows.map((row) => (
                    <CertificationCard
                      key={row.original.certification_id}
                      item={row.original}
                      onEditAction={handleOpenFormModal}
                      onDeleteAction={(item) =>
                        handleDeleteConfirmation([item])
                      }
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
            {!isItemsLoading && !itemsError && table.getPageCount() >= 1 && (
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
              {editingItem ? "Edit Certification" : "Add New Certification"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? `Update details for "${editingItem?.name}"`
                : "Provide details for the new certification."}
            </DialogDescription>
          </DialogHeader>
          <CertificationForm
            initialData={editingItem}
            mode={editingItem ? "edit" : "create"}
            onSubmitAttemptAction={handleFormSubmitAttempt}
            onCancelAction={() => {
              setIsFormModalOpen(false);
              setEditingItem(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{itemsToDelete.length} certification(s)</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
