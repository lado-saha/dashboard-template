"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AgencyDto, OrganizationDto } from "@/types/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminAgencyColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Building, Search } from "lucide-react";

interface AgenciesClientProps {
  allAgencies: AgencyDto[];
  allOrganizations: OrganizationDto[];
}

export function AgenciesClient({
  allAgencies,
  allOrganizations,
}: AgenciesClientProps) {
  const orgOptions = useMemo(
    () =>
      allOrganizations.map((org) => ({
        label: org.long_name || org.organization_id!,
        value: org.organization_id!,
      })),
    [allOrganizations]
  );

  const columns = useMemo<ColumnDef<AgencyDto>[]>(
    () => getSuperAdminAgencyColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={allAgencies}
      columns={columns}
      isLoading={false}
      error={null}
      onRefreshAction={() => window.location.reload()}
      searchPlaceholder="Search by agency name or location..."
      onDeleteItemsAction={() => {}}
      viewModeStorageKey="sa-agencies-view-mode"
      exportFileName="all_agencies.csv"
      pageHeader={
        <PageHeader
          title="Global Agency Overview"
          description="View and filter all agencies across the platform."
        />
      }
      filterControls={(table) => (
        <DataTableFacetedFilter
          column={table.getColumn("organization_id")}
          title="Organization"
          options={orgOptions}
        />
      )}
      renderGridItemAction={(agency) => (
        <div className="p-4 border rounded-md">{agency.long_name}</div>
      )} // Placeholder card
      emptyState={
        <FeedbackCard
          icon={Building}
          title="No Agencies Found"
          description="There are no agencies created on the platform yet."
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={Search}
          title="No Agencies Found"
          description="Your filter criteria did not match any agencies."
        />
      }
    />
  );
}
