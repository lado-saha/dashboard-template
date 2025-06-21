"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { AgencyDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";

import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataGrid } from "@/components/ui/data-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Loader2, AlertTriangle, Building, LayoutGrid, List, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ColumnDef, SortingState, ColumnFiltersState, VisibilityState, PaginationState, RowSelectionState, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, getFacetedRowModel, getFacetedUniqueValues } from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { ViewMode } from "@/types/common";
import { fuzzyGlobalFilterFn } from "@/lib/utils";
import { AgencyCard } from "@/components/organization/agencies/agency-card";
import { getAgencyColumns } from "@/components/organization/agencies/columns";

const statusOptions = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
];

export default function ManageAgenciesPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails, setActiveAgency } = useActiveOrganization();

  const [allItems, setAllItems] = useState<AgencyDto[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<AgencyDto[]>([]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilterAction] = useState<string>("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 9 });

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsItemsLoading(false);
      return;
    }
    setIsItemsLoading(true);
    setItemsError(null);
    try {
      const data = await organizationRepository.getAgencies(activeOrganizationId);
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

  useEffect(() => {
    table.setPageSize(viewMode === "grid" ? 9 : 10);
  }, [viewMode]);

  const refreshData = useCallback(() => setDataVersion(v => v + 1), []);

  const handleEnterAgency = async (agency: AgencyDto) => {
    toast.info(`Entering agency: ${agency.short_name}...`);
    await setActiveAgency(agency.agency_id!, agency);
    router.push('/business-actor/agency/dashboard');
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
        itemsToDelete.map(item =>
          organizationRepository.deleteAgency(activeOrganizationId, item.agency_id!)
        )
      );
      toast.success(`${itemsToDelete.length} agencies deleted.`);
      refreshData();
      table.resetRowSelection();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete agencies.");
    } finally {
      setIsDeleteDialogOpen(false);
      setItemsToDelete([]);
    }
  };

  const columns = useMemo<ColumnDef<AgencyDto>[]>(() => getAgencyColumns({
    onEnterAction: handleEnterAgency,
    onEditAction: handleEditAction,
    onDeleteAction: (item) => handleDeleteConfirmation([item]),
  }), []);

  const table = useReactTable({
    data: allItems,
    columns,
    state: { sorting, columnFilters, globalFilter, rowSelection, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilterAction,
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

  if (!activeOrganizationId) {
    return <div className="text-center p-8 border rounded-lg">Please select an organization to view its agencies.</div>
  }

  const renderContent = () => {
    if (isItemsLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      );
    }
    if (itemsError) {
      return <div className="text-center py-10 text-destructive">{itemsError}</div>;
    }
    return viewMode === 'grid' ? (
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
      <DataTable tableInstance={table} columns={columns} data={allItems} />
    );
  };
  
  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agency Management</h1>
            <p className="text-muted-foreground">Manage branches for <b>{activeOrganizationDetails?.long_name}</b></p>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-muted rounded-lg flex"><Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><LayoutGrid className="mr-2 h-4 w-4" /> Grid</Button><Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="mr-2 h-4 w-4" /> List</Button></div>
             <Button onClick={() => router.push('/business-actor/org/agencies/create')} size="sm" className="h-10"><PlusCircle className="mr-2 h-4 w-4" /> Add Agency</Button>
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
            filterControls={<DataTableFacetedFilter column={table.getColumn("is_active")} title="Status" options={statusOptions} />}
            bulkActions={<Button variant="destructive" size="sm" onClick={() => handleDeleteConfirmation(table.getFilteredSelectedRowModel().rows.map(r => r.original))} className="h-9"><Trash2 className="mr-2 h-4 w-4" /> Delete Selected</Button>}
          />
          {renderContent()}
        </CardContent>
      </Card>

      {table.getPageCount() > 1 && <DataTablePagination table={table} viewMode={viewMode} />}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} agency(s)</strong>. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
