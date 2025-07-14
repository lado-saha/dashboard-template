"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomerDto, OrganizationDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { PageHeader } from "@/components/ui/page-header";
import { getSuperAdminCustomerColumns } from "./columns";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Users, Search } from "lucide-react";

export function CustomersClient() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationRepository.getAllOrganizations();
      setOrganizations(orgs);
      
      const customerArrays = await Promise.all(
        orgs.map((org) =>
          organizationRepository.getOrgCustomers(org.organization_id!)
        )
      );
      setCustomers(customerArrays.flat());
    } catch (err: any) {
      setError(err.message || "Failed to fetch customer data.");
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

  const columns = useMemo<ColumnDef<CustomerDto>[]>(
    () => getSuperAdminCustomerColumns(),
    []
  );

  return (
    <ResourceDataTable
      data={customers}
      columns={columns}
      isLoading={isLoading}
      error={error}
      onRefreshAction={fetchData}
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
