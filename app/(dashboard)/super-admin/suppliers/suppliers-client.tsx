"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ProviderDto, OrganizationDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminSupplierColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Truck, Search } from "lucide-react";

export function SuppliersClient() {
  const [suppliers, setSuppliers] = useState<ProviderDto[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationRepository.getAllOrganizations();
      setOrganizations(orgs);
      
      const supplierArrays = await Promise.all(
        orgs.map(org => organizationRepository.getOrgSuppliers(org.organization_id!))
      );
      setSuppliers(supplierArrays.flat());
    } catch (err: any) {
      setError(err.message || "Failed to fetch supplier data.");
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

  const columns = useMemo<ColumnDef<ProviderDto>[]>(
    () => getSuperAdminSupplierColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={suppliers}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRefreshAction={fetchData}
      searchPlaceholder="Search by supplier name..."
      onDeleteItemsAction={() => {}}
      viewModeStorageKey="sa-suppliers-view-mode"
      exportFileName="all_suppliers.csv"
      pageHeader={
        <PageHeader
          title="Global Supplier Overview"
          description="View and filter all suppliers across the platform."
        />
      }
      filterControls={(table) => (
        <DataTableFacetedFilter
          column={table.getColumn("organization_id")}
          title="Organization"
          options={orgOptions}
        />
      )}
      renderGridItemAction={(supplier) => (
        <div className="p-4 border rounded-md">{supplier.first_name}</div>
      )}
      emptyState={
        <FeedbackCard
          icon={Truck}
          title="No Suppliers Found"
          description="There are no suppliers registered on the platform yet."
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={Search}
          title="No Suppliers Found"
          description="Your filter criteria did not match any suppliers."
        />
      }
    />
  );
}
