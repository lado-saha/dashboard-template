"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AgencyDto, OrganizationDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminAgencyColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Building, Search } from "lucide-react";

export function AgenciesClient() {
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationRepository.getAllOrganizations();
      setOrganizations(orgs);
      
      const agencyArrays = await Promise.all(
        orgs.map((org) =>
          organizationRepository.getAgencies(org.organization_id!)
        )
      );
      setAgencies(agencyArrays.flat());
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const orgOptions = useMemo(
    () =>
      organizations.map((org) => ({
        label: org.long_name || org.organization_id!,
        value: org.organization_id!,
      })),
    [organizations]
  );

  const columns = useMemo<ColumnDef<AgencyDto>[]>(
    () => getSuperAdminAgencyColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={agencies}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRefreshAction={fetchData}
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
      )}
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
