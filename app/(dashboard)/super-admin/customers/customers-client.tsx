"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomerDto, OrganizationDto } from "@/types/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminCustomerColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Users, Search } from "lucide-react";

interface CustomersClientProps {
  allCustomers: CustomerDto[];
  allOrganizations: OrganizationDto[];
}

export function CustomersClient({
  allCustomers,
  allOrganizations,
}: CustomersClientProps) {
  const orgOptions = useMemo(
    () =>
      allOrganizations.map((org) => ({
        label: org.long_name || org.organization_id!,
        value: org.organization_id!,
      })),
    [allOrganizations]
  );

  const columns = useMemo<ColumnDef<CustomerDto>[]>(
    () => getSuperAdminCustomerColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={allCustomers}
      columns={columns}
      isLoading={false}
      error={null}
      onRefreshAction={() => window.location.reload()}
      searchPlaceholder="Search by customer name..."
      onDeleteItemsAction={() => {}}
      viewModeStorageKey="sa-customers-view-mode"
      exportFileName="all_customers.csv"
      pageHeader={
        <PageHeader
          title="Global Customer Overview"
          description="View and filter all customers across the platform."
        />
      }
      filterControls={(table) => (
        <DataTableFacetedFilter
          column={table.getColumn("organization_id")}
          title="Organization"
          options={orgOptions}
        />
      )}
      renderGridItemAction={(customer) => (
        <div className="p-4 border rounded-md">{customer.first_name}</div>
      )}
      emptyState={
        <FeedbackCard
          icon={Users}
          title="No Customers Found"
          description="There are no customers registered on the platform yet."
        />
      }
      filteredEmptyState={
        <FeedbackCard
          icon={Search}
          title="No Customers Found"
          description="Your filter criteria did not match any customers."
        />
      }
    />
  );
}
