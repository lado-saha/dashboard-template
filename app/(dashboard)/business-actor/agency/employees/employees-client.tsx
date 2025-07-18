"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeDto, EmployeeRoleValues } from "@/types/organization";
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
import {
  PlusCircle,
  Users,
  Search as SearchIcon,
  Building,
} from "lucide-react";
import { getEmployeeColumns } from "@/components/organization/employees/columns";
import { EmployeeCard } from "@/components/organization/employees/employee-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

export function AgencyEmployeesClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } =
    useActiveOrganization();
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<EmployeeDto[]>([]);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId) {
      setIsLoading(false);
      setEmployees([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getAgencyEmployees(
        activeOrganizationId,
        activeAgencyId
      );
      setEmployees(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load agency employees.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleEditAction = (employeeId: string) =>
    router.push(
      `/business-actor/agency/employees/${employeeId}/edit`
    );
  const handleCreateAction = () =>
    router.push("/business-actor/agency/employees/create");

  const handleDeleteConfirmation = (items: EmployeeDto[]) => {
    if (items.length > 0) {
      setItemsToDelete(items);
      setIsDeleteDialogOpen(true);
    }
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || !activeAgencyId || itemsToDelete.length === 0)
      return;
    const promise = Promise.all(
      itemsToDelete.map((item) =>
        organizationRepository.deleteAgencyEmployee(
          activeOrganizationId,
          activeAgencyId,
          item.employee_id!
        )
      )
    );
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} employee(s)...`,
      success: () => {
        refreshData();
        setItemsToDelete([]);
        return "Employee(s) deleted.";
      },
      error: (err) => `Failed to delete: ${err.message}`,
    });
    setIsDeleteDialogOpen(false);
  };

  const roleOptions: DataTableFilterOption[] = useMemo(
    () =>
      EmployeeRoleValues.map((role) => ({
        label: role.replace(/_/g, " "),
        value: role,
      })),
    []
  );
  const departmentOptions: DataTableFilterOption[] = useMemo(() => {
    const departments = new Set(
      employees.map((item) => item.department).filter(Boolean)
    );
    return Array.from(departments).map((dept) => ({
      label: dept!,
      value: dept!,
    }));
  }, [employees]);

  const columns = useMemo<ColumnDef<EmployeeDto>[]>(
    () =>
      getEmployeeColumns(
        {
          onEditAction: handleEditAction,
          onDeleteAction: (item) => handleDeleteConfirmation([item]),
        },
        activeAgencyDetails ? [activeAgencyDetails] : []
      ),
    [activeAgencyDetails, router]
  );

  if (!activeAgencyId && !isLoading) {
    return (
      <FeedbackCard
        icon={Building}
        title="No Agency Selected"
        description="Please select an active agency to manage its employees."
      />
    );
  }

  return (
    <>
      <ResourceDataTable
        data={employees}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search agency employees..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="agency-employees-view-mode"
        exportFileName="agency_employees.csv"
        pageHeader={
          <PageHeader
            title="Agency Employees"
            description={`Manage the team for ${activeAgencyDetails?.long_name}`}
            action={
              <Button onClick={handleCreateAction}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            }
          />
        }
        filterControls={(table) => (
          <>
            <DataTableFacetedFilter
              column={table.getColumn("employee_role")}
              title="Role"
              options={roleOptions}
            />
            <DataTableFacetedFilter
              column={table.getColumn("department")}
              title="Department"
              options={departmentOptions}
            />
          </>
        )}
        renderGridItemAction={(employee) => (
          <EmployeeCard
            employee={employee}
            agency={activeAgencyDetails}
            onEditAction={(e) => handleEditAction(e)}
            onDeleteAction={(item) => handleDeleteConfirmation([item])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={Users}
            title="No Employees in this Agency"
            description="Assign an existing employee or create a new one for this agency."
            actionButton={
              <Button onClick={handleCreateAction}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Employees Found"
            description="Your search did not match any employees in this agency."
          />
        }
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{itemsToDelete.length} employee(s)</strong> from this
              agency.
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
