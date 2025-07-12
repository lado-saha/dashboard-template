"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { SalesPersonDto, CreateSalesPersonRequest, UpdateSalesPersonRequest } from "@/types/organization";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SalesPersonForm, SalesPersonFormData } from "@/components/organization/sales-people/sales-person-form";

export function AgencySalesPeopleClientPage() {
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } = useActiveOrganization();
  const [salesPeople, setSalesPeople] = useState<SalesPersonDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<SalesPersonDto[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSalesPerson, setEditingSalesPerson] = useState<SalesPersonDto | undefined>(undefined);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId) { setIsLoading(false); setSalesPeople([]); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getAgencySalesPersons(activeOrganizationId, activeAgencyId);
      setSalesPeople(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load agency sales people.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleOpenFormModal = (salesPerson?: SalesPersonDto) => {
    setEditingSalesPerson(salesPerson);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: SalesPersonDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || !activeAgencyId || itemsToDelete.length === 0) return;
    const originalItems = [...salesPeople];
    const idsToDelete = itemsToDelete.map(item => item.sales_person_id!);
    setSalesPeople(prev => prev.filter(item => !idsToDelete.includes(item.sales_person_id!)));
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(itemsToDelete.map(item => organizationRepository.deleteAgencySalesPerson(activeOrganizationId, activeAgencyId, item.sales_person_id!)));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} sales person(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Sales person(s) deleted."; },
      error: (err) => { setSalesPeople(originalItems); setItemsToDelete([]); return `Failed to delete: ${err.message}`; },
    });
  };

  const handleFormSubmit = async (data: SalesPersonFormData): Promise<boolean> => {
    if (!activeOrganizationId || !activeAgencyId) { toast.error("No active agency selected."); return false; }
    try {
      const promise = editingSalesPerson?.sales_person_id
        ? organizationRepository.updateAgencySalesPerson(activeOrganizationId, activeAgencyId, editingSalesPerson.sales_person_id, data as UpdateSalesPersonRequest)
        : organizationRepository.createAgencySalesPerson(activeOrganizationId, activeAgencyId, data as CreateSalesPersonRequest);
      
      await toast.promise(promise, {
        loading: `${editingSalesPerson ? 'Updating' : 'Creating'} sales person...`,
        success: `Sales person ${editingSalesPerson ? 'updated' : 'created'} successfully!`,
        error: (err) => err.message,
      });

      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const columns = useMemo<ColumnDef<SalesPersonDto>[]>(() => getSalesPersonColumns({ onEditAction: handleOpenFormModal, onDeleteAction: (item) => handleDeleteConfirmation([item]) }, [activeAgencyDetails!].filter(Boolean)), [activeAgencyDetails]);

  if (!activeAgencyId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Agency Selected" description="Please select an active agency to manage its sales people." />;
  }

  return (
    <>
      <ResourceDataTable
        data={salesPeople}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search agency sales people..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="agency-sales-people-view-mode"
        exportFileName="agency_sales_people.csv"
        pageHeader={<PageHeader title="Agency Sales People" description={`Manage the sales team for ${activeAgencyDetails?.long_name}`} action={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Sales Person</Button>} />}
        renderGridItemAction={(item) => <SalesPersonCard salesPerson={item} agencies={[]} onEditAction={handleOpenFormModal} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={UserCheck} title="No Sales People in this Agency" description="Add your first sales person to this agency's team." actionButton={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Sales Person</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Sales People Found" description="Your search did not match any sales people in this agency." />}
      />
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">{editingSalesPerson ? "Edit Sales Person" : "Add New Sales Person"}</DialogTitle>
          <SalesPersonForm mode={editingSalesPerson ? "edit" : "create"} initialData={editingSalesPerson} onSubmitAction={handleFormSubmit} agencies={[]} hideAgencySelector={true} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} sales person(s)</strong> from this agency.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}