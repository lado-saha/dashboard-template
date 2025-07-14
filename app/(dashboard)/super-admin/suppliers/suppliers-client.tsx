"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ProviderDto, OrganizationDto } from "@/types/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminSupplierColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Truck, Search } from "lucide-react";

interface SuppliersClientProps {
  allSuppliers: ProviderDto[];
  allOrganizations: OrganizationDto[];
}

export function SuppliersClient({
  allSuppliers,
  allOrganizations,
}: SuppliersClientProps) {
  const orgOptions = useMemo(
    () =>
      allOrganizations.map((org) => ({
        label: org.long_name || org.organization_id!,
        value: org.organization_id!,
      })),
    [allOrganizations]
  );

  const columns = useMemo<ColumnDef<ProviderDto>[]>(
    () => getSuperAdminSupplierColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={allSuppliers}
      columns={columns}
      isLoading={false}
      error={null}
      onRefreshAction={() => window.location.reload()}
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
