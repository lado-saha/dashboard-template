"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { AgencyDto } from "@/types/organization";

import { DataTable } from "@/components/ui/data-table";
import { DataGrid } from "@/components/ui/data-grid";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  AlertTriangle,
  Inbox,
  Building,
  Trash2,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { toast } from "sonner";
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
} from "@tanstack/react-table";
import { getAgencyColumns } from "@/components/organization/agencies/columns";
import { AgencyCard } from "@/components/organization/agencies/agency-card";
import { Card, CardContent } from "@/components/ui/card";
import { cn, fuzzyGlobalFilterFn } from "@/lib/utils";
import { DataTableFilterOption } from "@/types/table";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { ViewMode } from "@/types/common";
import { ListViewSkeleton } from "@/components/ui/list-view-skeleton";

const statusOptions: DataTableFilterOption[] = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function ManageAgenciesPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails, setActiveAgency } =
    useActiveOrganization();

  const [allItems, setAllItems] = useState<AgencyDto[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<AgencyDto[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilterAction] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsItemsLoading(false);
      return;
    }
    setIsItemsLoading(true);
    setItemsError(null);
    try {
      const data = await organizationRepository.getAgencies(
        activeOrganizationId
      );
      setAllItems(data || []);
    } catch (err: any) {
      setItemsError(err.message || "Could not load agencies.");
    } finally {
      setIsItemsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, dataVersion]);

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  const handleEnterAgency = async (agency: AgencyDto) => {
    toast.info(`Entering agency: ${agency.short_name}...`);
    await setActiveAgency(agency.agency_id!, agency);
    router.push("/business-actor/agency/dashboard");
  };

  const handleEditAction = (agencyId: string) => {
    router.push(`/business-actor/org/agencies/${agencyId}/edit`);
  };

  const handleDeleteConfirmation = (items: AgencyDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    try {
      await Promise.all(
        itemsToDelete.map((item) =>
          organizationRepository.deleteAgency(
            activeOrganizationId,
            item.agency_id!
          )
        )
      );
      toast.success(`${itemsToDelete.length} agency(s) deleted successfully.`);
      refreshData();
      table.resetRowSelection();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete agencies.");
    } finally {
      setIsDeleteDialogOpen(false);
      setItemsToDelete([]);
    }
  };

  const columns = useMemo<ColumnDef<AgencyDto>[]>(
    () =>
      getAgencyColumns({
        onEnterAction: handleEnterAgency,
        onEditAction: handleEditAction,
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
    enableRowSelection: true,
  });

  const renderContent = () => {
    {
      isItemsLoading && <ListViewSkeleton viewMode={viewMode} />;
    }
    {
      !isItemsLoading && itemsError && (
        <div className="min-h-[200px] flex flex-col justify-center items-center p-6 border border-destructive/50 bg-destructive/10 rounded-lg text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
          <p className="text-destructive-foreground font-medium">
            {itemsError}
          </p>
          <Button onClick={refreshData} variant="destructive" className="mt-4">
            Try Again
          </Button>
        </div>
      );
    }
    if (itemsError) {
      return (
        <div className="min-h-[300px] flex flex-col justify-center items-center p-10 border border-destructive/50 bg-destructive/10 rounded-lg text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive-foreground font-semibold">
            {itemsError}
          </p>
          <Button onClick={refreshData} variant="destructive" className="mt-6">
            Try Again
          </Button>
        </div>
      );
    }
    if (table.getRowModel().rows.length === 0) {
      const hasFilters = globalFilter || columnFilters.length > 0;
      return (
        <div className="min-h-[300px] text-center flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-10">
          <Building className="h-16 w-16 text-muted-foreground/70 mb-6" />
          <h3 className="text-lg font-semibold">
            {hasFilters
              ? "No Agencies Match Filters"
              : "No Agencies Created Yet"}
          </h3>
          <p className="text-sm mt-1">
            {hasFilters
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first agency."}
          </p>
        </div>
      );
    }
    return (
      <>
        {viewMode === "grid" ? (
          <DataGrid
            table={table}
            renderCardAction={({ row }) => (
              <AgencyCard
                agency={row.original}
                onEnterAction={handleEnterAgency}
                onEditAction={handleEditAction}
                onDeleteAction={(item) => handleDeleteConfirmation([item])}
              />
            )}
          />
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
        )}

        {!isItemsLoading && !itemsError && table.getPageCount() >= 0 && (
          <div className="mt-7">
            <DataTablePagination table={table} viewMode={viewMode} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Agency Management
            </h1>
            <p className="text-muted-foreground">
              Manage branches for <b>{activeOrganizationDetails?.long_name}</b>
            </p>
          </div>
          <div className="flex items-center gap-x-2 flex-shrink-0">
            <div className="flex items-center p-0.5 bg-muted rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-9 px-3",
                  viewMode === "grid" &&
                    "bg-background text-foreground shadow-sm"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-9 px-3",
                  viewMode === "list" &&
                    "bg-background text-foreground shadow-sm"
                )}
              >
                <LayoutList className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline">List</span>
              </Button>
            </div>
            <Button
              onClick={() => router.push("/business-actor/org/agencies/create")}
              size="sm"
              className="h-10"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Agency
            </Button>
          </div>
        </div>
      </header>

      <Card>
        <CardContent className="pt-6">
          <DataTableToolbar
            table={table}
            viewMode={viewMode}
            globalFilter={globalFilter}
            onGlobalFilterChangeAction={setGlobalFilterAction}
            searchPlaceholder="Search agencies..."
            filterControls={
              <DataTableFacetedFilter
                column={table.getColumn("is_active")}
                title="Status"
                options={statusOptions}
              />
            }
            bulkActions={
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  handleDeleteConfirmation(
                    table
                      .getFilteredSelectedRowModel()
                      .rows.map((r) => r.original)
                  )
                }
                className="h-9"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
              </Button>
            }
          />
          <main className="mt-4">{renderContent()}</main>
        </CardContent>
      </Card>
      {/* THE FIX: Moved pagination outside the Card */}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{itemsToDelete.length} agency(s)</strong> and all
              associated data. This action cannot be undone.
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
