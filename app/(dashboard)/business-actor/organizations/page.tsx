"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { OrganizationDto, OrganizationStatus } from "@/types/organization";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { OrganizationCard } from "@/components/organization/organization-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { getOrganizationColumns } from "@/components/organization/organization-columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";
import { toast } from "sonner";

const statusOptions: DataTableFilterOption[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "PENDING_APPROVAL", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
];

export default function OrganizationsHubPage() {
  const router = useRouter();
  const {
    userOrganizations,
    isLoadingUserOrgs,
    setActiveOrganization,
    fetchUserOrganizationsList,
  } = useActiveOrganization();

  const handleEnterDashboard = (org: OrganizationDto) => {
    if (!org.organization_id) return;
    setActiveOrganization(org.organization_id, org);
    router.push("/business-actor/dashboard");
  };

  const handleEditOrganization = (orgId: string) => {
    setActiveOrganization(orgId);
    router.push("/business-actor/org/profile");
  };

  const handleDeleteOrganizations = (orgs: OrganizationDto[]) => {
    toast.error(
      `Deletion of ${orgs.length} organization(s) is not yet implemented.`
    );
  };

  const columns = useMemo<ColumnDef<OrganizationDto>[]>(
    () =>
      getOrganizationColumns({
        onEnterAction: handleEnterDashboard,
        onEditAction: handleEditOrganization,
        onDeleteAction: (org) => handleDeleteOrganizations([org]),
      }),
    []
  );

  return (
    <ResourceDataTable
      data={userOrganizations}
      columns={columns}
      isLoading={isLoadingUserOrgs}
      error={null} // Assuming context handles errors via toast for now
      onRefreshAction={fetchUserOrganizationsList}
      searchPlaceholder="Search organizations..."
      onDeleteItemsAction={handleDeleteOrganizations}
      viewModeStorageKey="organizations-hub-view-mode"
      exportFileName="my_organizations.csv"
      pageHeader={
        <PageHeader
          title="Your Organizations"
          description="Select an organization to manage, or create a new one."
          action={
            <Button
              onClick={() => router.push("/business-actor/organization/create")}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Organization
            </Button>
          }
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
        <OrganizationCard
          organization={org}
          onEnterAction={handleEnterDashboard}
          onEditAction={handleEditOrganization}
          onDeleteAction={(organization) =>
            handleDeleteOrganizations([organization])
          }
        />
      )}
      emptyState={
        <FeedbackCard
          icon={Briefcase}
          title="No Organizations Found"
          description="You haven't created or joined any organizations yet. Get started by creating your first one."
          actionButton={
            <Button
              onClick={() => router.push("/business-actor/organization/create")}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Organization
            </Button>
          }
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={SearchIcon}
          title="No Organizations Found"
          description="Your search or filter criteria did not match any of your organizations."
        />
      }
    />
  );
}
