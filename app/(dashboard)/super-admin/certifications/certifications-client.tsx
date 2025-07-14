"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CertificationDto, OrganizationDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminCertificationColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Award, Search } from "lucide-react";

export function CertificationsClient() {
  const [certifications, setCertifications] = useState<CertificationDto[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationRepository.getAllOrganizations();
      setOrganizations(orgs);
      
      const certArrays = await Promise.all(
        orgs.map((org) =>
          organizationRepository.getCertifications(org.organization_id!)
        )
      );
      setCertifications(certArrays.flat());
    } catch (err: any) {
      setError(err.message || "Failed to fetch certifications.");
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

  const columns = useMemo<ColumnDef<CertificationDto>[]>(
    () => getSuperAdminCertificationColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={certifications}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRefreshAction={fetchData}
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
