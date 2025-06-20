"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  EmployeeDto,
  AgencyDto,
  EmployeeRole,
  EmployeeRoleValues,
} from "@/types/organization";
import { DataTable } from "@/components/ui/data-table";
import { DataGrid } from "@/components/ui/data-grid";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  Loader2,
  AlertTriangle,
  Inbox,
  Users,
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
import { getEmployeeColumns } from "@/components/organization/employees/columns";
import { EmployeeCard } from "@/components/organization/employees/employee-card";
import { Card, CardContent } from "@/components/ui/card";
import { cn, fuzzyGlobalFilterFn } from "@/lib/utils";
import { DataTableFilterOption } from "@/types/table";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { ViewMode } from "@/types/common";

export default function ManageEmployeesPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails } =
    useActiveOrganization();

  const [allItems, setAllItems] = useState<EmployeeDto[]>([]);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<EmployeeDto[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list"); // 3. Initial view set to list

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilterAction] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 12,
  });

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsItemsLoading(false);
      return;
    }
    setIsItemsLoading(true);
    setItemsError(null);
    try {
      const [employeesData, agenciesData] = await Promise.all([
        organizationRepository.getOrgEmployees(activeOrganizationId),
        organizationRepository.getAgencies(activeOrganizationId),
      ]);
      setAllItems(employeesData || []);
      setAgencies(agenciesData || []);
    } catch (err: any) {
      setItemsError(err.message || "Could not load employee data.");
    } finally {
      setIsItemsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, dataVersion]);

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  const handleEditAction = (employeeId: string) => {
    router.push(`/business-actor/org/employees/${employeeId}`);
  };

  const handleDeleteConfirmation = (items: EmployeeDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    try {
      await Promise.all(
        itemsToDelete.map((item) =>
          organizationRepository.deleteOrgEmployee(
            activeOrganizationId,
            item.employee_id!
          )
        )
      );
      toast.success(`${itemsToDelete.length} employee(s) deleted.`);
      refreshData();
      table.resetRowSelection();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete employee(s).");
    } finally {
      setIsDeleteDialogOpen(false);
      setItemsToDelete([]);
    }
  };

  const roleOptions: DataTableFilterOption[] = useMemo(
    () =>
      Object.values(EmployeeRoleValues).map((role) => ({
        label:
          role.replace(/_/g, " ").charAt(0).toUpperCase() +
          role.replace(/_/g, " ").slice(1).toLowerCase(),
        value: role,
      })),
    []
  );

  const departmentOptions: DataTableFilterOption[] = useMemo(() => {
    const departments = new Set(
      allItems.map((item) => item.department).filter(Boolean)
    );
    return Array.from(departments).map((dept) => ({
      label: dept!,
      value: dept!,
    }));
  }, [allItems]);

  const agencyOptions: DataTableFilterOption[] = useMemo(() => {
    const options = agencies.map((agency) => ({
      label: agency.long_name!,
      value: agency.agency_id!,
    }));
    options.unshift({ label: "Headquarters", value: "headquarters" });
    return options;
  }, [agencies]);

  const columns = useMemo<ColumnDef<EmployeeDto>[]>(
    () =>
      getEmployeeColumns(
        {
          onEditAction: handleEditAction,
          onDeleteAction: (item) => handleDeleteConfirmation([item]),
        },
        agencies
      ),
    [agencies]
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
    if (isItemsLoading) {
      return viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <Skeleton className="h-[400px] w-full rounded-md" />
      );
    }
    if (itemsError) {
      return (
        <div className="text-center py-10 text-destructive">{itemsError}</div>
      );
    }
    if (allItems.length === 0) {
      return (
        <div className="min-h-[300px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-lg p-6">
          <Users className="h-12 w-12 text-muted-foreground/70 mb-4" />
          <h3 className="text-lg font-semibold">No Employees Found</h3>
          <p className="text-sm">
            Get started by clicking "Add Employee" to build your team.
          </p>
        </div>
      );
    }

    return (
      <>
        {viewMode === "grid" ? (
          <DataGrid
            table={table}
            renderCardAction={({ row }) => {
              const agency = agencies.find(
                (a) => a.agency_id === row.original.agency_id
              );
              return (
                <EmployeeCard
                  employee={row.original}
                  agency={agency}
                  onEditAction={handleEditAction}
                  onDeleteAction={(item) => handleDeleteConfirmation([item])}
                />
              );
            }}
          />
        ) : (
          <DataTable tableInstance={table} columns={columns} data={allItems} />
        )}
        {table.getPageCount() > 1 && (
          <DataTablePagination table={table} viewMode={viewMode} />
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
              Employee Roster
            </h1>
            {/* 1. Better Subtitle */}
            <p className="text-muted-foreground">
              Add, view, and assign roles to your team members for{" "}
              <b>
                {activeOrganizationDetails?.long_name || "your organization"}
              </b>
              .
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
              onClick={() =>
                router.push("/business-actor/org/employees/create")
              }
              size="sm"
              className="h-10"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </div>
        </div>
      </header>
      <Card>
        <CardContent>
          <DataTableToolbar
            table={table}
            viewMode={viewMode}
            globalFilter={globalFilter}
            onGlobalFilterChangeAction={setGlobalFilterAction}
            searchPlaceholder="Search by name, title..."
            filterControls={
              <>
                {table.getColumn("employee_role") && (
                  <DataTableFacetedFilter
                    column={table.getColumn("employee_role")}
                    title="Role"
                    options={roleOptions}
                  />
                )}
                {table.getColumn("department") && (
                  <DataTableFacetedFilter
                    column={table.getColumn("department")}
                    title="Department"
                    options={departmentOptions}
                  />
                )}
                {table.getColumn("agency_id") && (
                  <DataTableFacetedFilter
                    column={table.getColumn("agency_id")}
                    title="Assignment"
                    options={agencyOptions}
                  />
                )}
              </>
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
          {/* 2. Added padding */}
          <main className="mt-4">{renderContent()}</main>
        </CardContent>
      </Card>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{itemsToDelete.length} employee(s)</strong>.
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
