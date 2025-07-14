"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  OrganizationDto,
  OrganizationStatus,
  OrganizationStatusValues,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Building, Search as SearchIcon } from "lucide-react";
import { getSuperAdminOrganizationColumns } from "./columns";
import { AdminOrganizationCard } from "./organization-card";
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
import { FeedbackCard } from "@/components/ui/feedback-card";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

const statusOptions = OrganizationStatusValues.map((s) => ({
  value: s,
  label: s.replace(/_/g, " "),
}));

export function OrganizationsClient() {
  const [organizations, setOrganizations] =
    useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    items: OrganizationDto[];
    newStatus?: OrganizationStatus;
    type?: "status" | "delete";
  }>({ open: false, items: [] });

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getAllOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to refresh organization data.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleStatusChangeConfirmation = (
    org: OrganizationDto,
    newStatus: OrganizationStatus
  ) => {
    setDialogState({ open: true, items: [org], newStatus, type: "status" });
  };

  const handleDeleteConfirmation = (orgs: OrganizationDto[]) => {
    if (orgs.length === 0) return;
    setDialogState({ open: true, items: orgs, type: "delete" });
  };

  const executeAction = async () => {
    const { items, newStatus, type } = dialogState;
    if (items.length === 0) return;

    const actionPromise: Promise<void> =
      type === "status" && newStatus
        ? organizationRepository
            .updateOrganizationStatus(items[0].organization_id!, {
              status: newStatus,
            })
            .then(() => {})
        : Promise.all(
            items.map((org) =>
              organizationRepository.deleteOrganization(org.organization_id!)
            )
          ).then(() => {});

    toast.promise(actionPromise, {
      loading: `Processing action...`,
      success: () => {
        refreshData();
        setDialogState({ open: false, items: [] });
        return `Action completed successfully.`;
      },
      error: (err) => `An error occurred: ${err.message}`,
    });
  };

  const columns = useMemo<ColumnDef<OrganizationDto>[]>(
    () =>
      getSuperAdminOrganizationColumns({
        onStatusChangeAction: handleStatusChangeConfirmation,
        onDeleteAction: (org) => handleDeleteConfirmation([org]),
      }),
    []
  );

  return (
    <>
      <ResourceDataTable
        data={organizations}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search by name, email..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="sa-orgs-view-mode"
        exportFileName="organizations_export.csv"
        pageHeader={
          <PageHeader
            title="Organization Management"
            description="Monitor, approve, and manage all organizations on the platform."
          />
        }
        filterControls={(table) => (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statusOptions}
          />
        )}
        renderGridItemAction={(org) => (
          <AdminOrganizationCard
            organization={org}
            onStatusChangeAction={handleStatusChangeConfirmation}
            onDeleteAction={() => handleDeleteConfirmation([org])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={Building}
            title="No Organizations Found"
            description="There are currently no organizations registered on the platform."
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Organizations Found"
            description="Your search or filter criteria did not match any organizations."
          />
        }
      />

      <AlertDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.type === "delete"
                ? `This will permanently delete ${dialogState.items.length} organization(s). This action cannot be undone.`
                : `This will change the status of "${dialogState.items[0]?.long_name}" to ${dialogState.newStatus}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
