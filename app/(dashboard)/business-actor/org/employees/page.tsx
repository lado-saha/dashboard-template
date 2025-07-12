"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  EmployeeDto,
  AgencyDto,
  EmployeeRoleValues,
} from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
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
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search as SearchIcon } from "lucide-react";
import { getEmployeeColumns } from "@/components/organization/employees/columns";
import { EmployeeCard } from "@/components/organization/employees/employee-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";
import { FeedbackCard } from "@/components/ui/feedback-card";

export default function ManageEmployeesPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails } =
    useActiveOrganization();

  const [allItems, setAllItems] = useState<EmployeeDto[]>([]);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<EmployeeDto[]>([]);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [employeesData, agenciesData] = await Promise.all([
        organizationRepository.getOrgEmployees(activeOrganizationId),
        organizationRepository.getAgencies(activeOrganizationId, true),
      ]);
      setAllItems(employeesData || []);
      setAgencies(agenciesData || []);
    } catch (err) {
      setError(err.message || "Could not load employee data.");
    } finally {
      setIsLoading(false);
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
    const originalItems = [...allItems];
    const idsToDelete = itemsToDelete.map((item) => item.employee_id!);
    setAllItems((prev) =>
      prev.filter((item) => !idsToDelete.includes(item.employee_id!))
    );
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(
      itemsToDelete.map((item) =>
        organizationRepository.deleteOrgEmployee(
          activeOrganizationId,
          item.employee_id!
        )
      )
    );

    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} employee(s)...`,
      success: () => {
        refreshData();
        setItemsToDelete([]);
        return `${itemsToDelete.length} employee(s) deleted.`;
      },
      error: (err) => {
        setAllItems(originalItems);
        setItemsToDelete([]);
        return `Failed to delete: ${err.message}`;
      },
    });
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

  return (
    <>
      <ResourceDataTable
        data={allItems}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search by name, title..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="employees-view-mode"
        exportFileName="employees_export.csv"
        pageHeader={
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Employee Roster
              </h1>
              <p className="text-muted-foreground">
                Manage team members for{" "}
                <b>{activeOrganizationDetails?.long_name}</b>.
              </p>
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
        }
        filterControls={(table) => (
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
        )}
        renderGridItemAction={(employee) => {
          const agency = agencies.find(
            (a) => a.agency_id === employee.agency_id
          );
          return (
            <EmployeeCard
              employee={employee}
              agency={agency}
              onEditAction={handleEditAction}
              onDeleteAction={(item) => handleDeleteConfirmation([item])}
            />
          );
        }}
        emptyState={
          <FeedbackCard
            icon={Users}
            title="No Employees Added Yet"
            description="Get started by adding your first team member to the organization."
            actionButton={
              <Button
                onClick={() =>
                  router.push("/business-actor/org/employees/create")
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Employees Found"
            description="Your search or filter criteria did not match any employees."
          />
        }
      />

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
    </>
  );
}
