"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { SalesPersonDto, AgencyDto } from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCheck, Search as SearchIcon, Building } from "lucide-react";
import { getSalesPersonColumns } from "@/components/organization/sales-people/columns";
import { SalesPersonCard } from "@/components/organization/sales-people/sales-person-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

export function OrgSalesPeopleClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails } = useActiveOrganization();
  const [salesPeople, setSalesPeople] = useState<SalesPersonDto[]>([]);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<SalesPersonDto[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  useEffect(() => {
    async function fetchData() {
      if (!activeOrganizationId) {
        setIsLoading(false);
        setSalesPeople([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const [agenciesData, hqData] = await Promise.all([
          organizationRepository.getAgencies(activeOrganizationId),
          organizationRepository.getOrgSalesPersons(activeOrganizationId),
        ]);
        setAgencies(agenciesData || []);
        const agencyPromises = (agenciesData || []).map((agency) =>
          organizationRepository.getAgencySalesPersons(activeOrganizationId, agency.agency_id!)
        );
        const agencyResults = await Promise.all(agencyPromises);
        setSalesPeople([...(hqData || []), ...agencyResults.flat()]);
      } catch (err: any) {
        setError(err.message || "Could not load sales people.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [activeOrganizationId, dataVersion]);

  // REASON: Changed from dialog to navigation
  const handleEditAction = (item: SalesPersonDto) => {
    router.push(`/business-actor/org/sales-people/${item.sales_person_id}/edit`);
  };

  const handleCreateAction = () => {
    router.push(`/business-actor/org/sales-people/create`);
  }

  const handleDeleteConfirmation = (items: SalesPersonDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const promise = Promise.all(
      itemsToDelete.map((item) =>
        item.agency_id
          ? organizationRepository.deleteAgencySalesPerson(activeOrganizationId, item.agency_id, item.sales_person_id!)
          : organizationRepository.deleteOrgSalesPerson(activeOrganizationId, item.sales_person_id!)
      )
    );
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} sales person(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Sales person(s) deleted."; },
      error: (err) => `Failed to delete: ${err.message}`,
    });
    setIsDeleteDialogOpen(false);
  };

  const columns = useMemo<ColumnDef<SalesPersonDto>[]>(() => getSalesPersonColumns({
    onEditAction: handleEditAction,
    onDeleteAction: (sp) => handleDeleteConfirmation([sp]),
  }, agencies), [agencies, router]);

  const agencyFilterOptions: DataTableFilterOption[] = useMemo(() => [
    { value: "headquarters", label: "Headquarters" },
    ...agencies.map((a) => ({ value: a.agency_id!, label: a.short_name! })),
  ], [agencies]);

  if (!activeOrganizationId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an active organization to manage sales people." />;
  }

  return (
    <>
      <ResourceDataTable
        data={salesPeople}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search sales people..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-sales-people-view-mode"
        exportFileName="organization_sales_people.csv"
        pageHeader={
          <PageHeader
            title="Sales People"
            description={`Manage all sales people for ${activeOrganizationDetails?.long_name}`}
            action={<Button onClick={handleCreateAction}><PlusCircle className="mr-2 h-4 w-4" /> Add Sales Person</Button>}
          />
        }
        filterControls={(table) => <DataTableFacetedFilter column={table.getColumn("agency_id")} title="Agency" options={agencyFilterOptions} />}
        renderGridItemAction={(item) => (
          <SalesPersonCard salesPerson={item} agencies={agencies} onEditAction={handleEditAction} onDeleteAction={(dto) => { handleDeleteConfirmation([dto]); }} />
        )}
        emptyState={
          <FeedbackCard icon={UserCheck} title="No Sales People Yet" description="Add your first sales person to build your sales team." actionButton={<Button onClick={handleCreateAction}><PlusCircle className="mr-2 h-4 w-4" /> Add Sales Person</Button>} />
        }
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Sales People Found" description="Your search did not match any sales people." />}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} sales person(s)</strong>.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
