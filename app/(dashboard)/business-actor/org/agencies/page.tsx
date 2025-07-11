"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { AgencyDto } from "@/types/organization";
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
import { PlusCircle, Building, SearchIcon } from "lucide-react";
import { getAgencyColumns } from "@/components/organization/agencies/columns";
import { AgencyCard } from "@/components/organization/agencies/agency-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";
import { FeedbackCard } from "@/components/ui/feedback-card";

const statusOptions: DataTableFilterOption[] = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function ManageAgenciesPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails, setActiveAgency } =
    useActiveOrganization();

  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<AgencyDto[]>([]);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getAgencies(
        activeOrganizationId
      );
      setAgencies(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load agencies.");
    } finally {
      setIsLoading(false);
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
    const promise = Promise.all(
      itemsToDelete.map((item) =>
        organizationRepository.deleteAgency(
          activeOrganizationId,
          item.agency_id!
        )
      )
    );

    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} agency(s)...`,
      success: () => {
        refreshData();
        setIsDeleteDialogOpen(false);
        setItemsToDelete([]);
        return `${itemsToDelete.length} agency(s) deleted successfully.`;
      },
      error: (err) => `Failed to delete agencies: ${err.message}`,
    });
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

  return (
    <>
      <ResourceDataTable
        data={agencies}
        columns={columns}
        isLoading={isLoading}
        error={error}
        viewModeStorageKey="agencies-view-mode"
        exportFileName="agencies_export.csv"
        onRefreshAction={refreshData}
        searchPlaceholder="Search agencies by name or location..."
        onDeleteItemsAction={handleDeleteConfirmation}
        pageHeader={
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Agency Management
              </h1>
              <p className="text-muted-foreground">
                Manage branches for{" "}
                <b>{activeOrganizationDetails?.long_name}</b>
              </p>
            </div>
            <Button
              onClick={() => router.push("/business-actor/org/agencies/create")}
              size="sm"
              className="h-10"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Agency
            </Button>
          </div>
        }
        filterControls={(table) => (
          <DataTableFacetedFilter
            column={table.getColumn("is_active")}
            title="Status"
            options={statusOptions}
          />
        )}
        renderGridItemAction={(agency) => (
          <AgencyCard
            agency={agency}
            onEnterAction={handleEnterAgency}
            onEditAction={handleEditAction}
            onDeleteAction={(item) => handleDeleteConfirmation([item])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={Building}
            title="No Agencies Created Yet"
            description="Get started by adding your first agency to manage your operations."
            actionButton={
              <Button
                onClick={() =>
                  router.push("/business-actor/org/agencies/create")
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Create Agency
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Agencies Found"
            description="Your search or filter criteria did not match any agencies. Try something different."
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
    </>
  );
}
