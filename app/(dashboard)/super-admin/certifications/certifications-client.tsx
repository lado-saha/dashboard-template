"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CertificationDto, OrganizationDto } from "@/types/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminCertificationColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Award, Search } from "lucide-react";

interface CertificationsClientProps {
  allCertifications: CertificationDto[];
  allOrganizations: OrganizationDto[];
}

export function CertificationsClient({
  allCertifications,
  allOrganizations,
}: CertificationsClientProps) {
  const orgOptions = useMemo(
    () =>
      allOrganizations.map((org) => ({
        label: org.long_name || org.organization_id!,
        value: org.organization_id!,
      })),
    [allOrganizations]
  );

  const columns = useMemo<ColumnDef<CertificationDto>[]>(
    () => getSuperAdminCertificationColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={allCertifications}
      columns={columns}
      isLoading={false}
      error={null}
      onRefreshAction={() => window.location.reload()}
      searchPlaceholder="Search by certification name or type..."
      onDeleteItemsAction={() => {}}
      viewModeStorageKey="sa-certs-view-mode"
      exportFileName="all_certifications.csv"
      pageHeader={
        <PageHeader
          title="Global Certification Overview"
          description="View and filter all certifications across the platform."
        />
      }
      filterControls={(table) => (
        <DataTableFacetedFilter
          column={table.getColumn("organization_id")}
          title="Organization"
          options={orgOptions}
        />
      )}
      renderGridItemAction={(cert) => (
        <div className="p-4 border rounded-md">{cert.name}</div>
      )}
      emptyState={
        <FeedbackCard
          icon={Award}
          title="No Certifications Found"
          description="No organizations have added certifications yet."
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={Search}
          title="No Certifications Found"
          description="Your filter criteria did not match any certifications."
        />
      }
    />
  );
}
