"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
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

export function OrgEmployeesClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails } =
    useActiveOrganization();
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<EmployeeDto[]>([]);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsLoading(false);
      setEmployees([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [employeesData, agenciesData] = await Promise.all([
        organizationRepository.getOrgEmployees(activeOrganizationId),
        organizationRepository.getAgencies(activeOrganizationId, true),
      ]);
      setEmployees(employeesData || []);
      setAgencies(agenciesData || []);
    } catch (err: any) {
      setError(err.message || "Could not load employee data.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleEditAction = (employeeId: string) =>
    router.push(`/business-actor/org/employees/${employeeId}`);
  const handleDeleteConfirmation = (items: EmployeeDto[]) => {
    if (items.length > 0) {
      setItemsToDelete(items);
      setIsDeleteDialogOpen(true);
    }
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...employees];
    const idsToDelete = itemsToDelete.map((item) => item.employee_id!);
    setEmployees((prev) =>
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
        return "Employee(s) deleted.";
      },
      error: (err) => {
        setEmployees(originalItems);
        setItemsToDelete([]);
        return `Failed to delete: ${err.message}`;
      },
    });
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

  if (!activeOrganizationId && !isLoading) {
    return (
      <FeedbackCard
        icon={Building}
        title="No Organization Selected"
        description="Please select an active organization to manage its employees."
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
        searchPlaceholder="Search employees..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-employees-view-mode"
        exportFileName="organization_employees.csv"
        pageHeader={
          <PageHeader
            title="Employee Roster"
            description={`Manage all employees for ${activeOrganizationDetails?.long_name}`}
            action={
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
            <DataTableFacetedFilter
              column={table.getColumn("agency_id")}
              title="Agency"
              options={agencyOptions}
            />
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
            title="No Employees Yet"
            description="Add your first employee to build your team."
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
            description="Your search did not match any employees."
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
