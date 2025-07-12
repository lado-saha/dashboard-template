"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { PracticalInformationDto, CreatePracticalInformationRequest, UpdatePracticalInformationRequest } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { PracticalInfoForm, PracticalInfoFormData } from "@/components/organization/practical-info/practical-info-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Info, Search as SearchIcon, Building } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { getPracticalInfoColumns } from "@/components/organization/practical-info/columns";
import { PracticalInfoCard } from "@/components/organization/practical-info/practical-info-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

const getPracticalInfoTypeOptions = (items: PracticalInformationDto[]): DataTableFilterOption[] => {
  const allTypes = items.map((item) => item.type).filter((type): type is string => typeof type === 'string');
  return [...new Set(allTypes)].map((type) => ({ label: type, value: type })).sort((a, b) => a.label.localeCompare(b.label));
};

export function PracticalInfoClientPage() {
  const { activeOrganizationId, activeOrganizationDetails } = useActiveOrganization();
  const [allItems, setAllItems] = useState<PracticalInformationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PracticalInformationDto | undefined>(undefined);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<PracticalInformationDto[]>([]);

  const derivedTypeOptions = useMemo(() => getPracticalInfoTypeOptions(allItems), [allItems]);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId) { setIsLoading(false); setAllItems([]); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getPracticalInformation(activeOrganizationId);
      setAllItems(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load practical information.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleFormSubmit = async (data: PracticalInfoFormData): Promise<boolean> => {
    if (!activeOrganizationId) { toast.error("No active organization selected."); return false; }
    try {
      const promise = editingItem?.information_id
        ? organizationRepository.updatePracticalInformation(activeOrganizationId, editingItem.information_id, data as UpdatePracticalInformationRequest)
        : organizationRepository.createPracticalInformation(activeOrganizationId, data as CreatePracticalInformationRequest);
      
      await toast.promise(promise, {
        loading: `${editingItem ? 'Updating' : 'Adding'} information...`,
        success: `Information ${editingItem ? 'updated' : 'added'} successfully!`,
        error: (err) => err.message,
      });

      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleOpenFormModal = (item?: PracticalInformationDto) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: PracticalInformationDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...allItems];
    const idsToDelete = itemsToDelete.map(item => item.information_id!);
    setAllItems(prev => prev.filter(item => !idsToDelete.includes(item.information_id!)));
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(itemsToDelete.map((item) => organizationRepository.deletePracticalInformation(activeOrganizationId, item.information_id!)));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} item(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Item(s) deleted."; },
      error: (err) => { setAllItems(originalItems); setItemsToDelete([]); return `Failed to delete: ${err.message}`; },
    });
  };

  const columns = useMemo<ColumnDef<PracticalInformationDto>[]>(() => getPracticalInfoColumns({ onEditAction: handleOpenFormModal, onDeleteAction: (item) => handleDeleteConfirmation([item]) }), []);

  if (!activeOrganizationId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an active organization to manage its practical info." />;
  }

  return (
    <>
      <ResourceDataTable
        data={allItems}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search by type, value..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-practical-info-view-mode"
        exportFileName="practical_info.csv"
        pageHeader={<PageHeader title="Practical Information" description={`Manage operational details for ${activeOrganizationDetails?.long_name}`} action={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>} />}
        filterControls={(table) => derivedTypeOptions.length > 0 ? <DataTableFacetedFilter column={table.getColumn("type")} title="Type" options={derivedTypeOptions} /> : null}
        renderGridItemAction={(item) => <PracticalInfoCard item={item} onEditAction={handleOpenFormModal} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Info} title="No Practical Information Added" description="Add useful details for your team or customers, like opening hours or contact info." actionButton={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Information</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Information Found" description="Your search or filter criteria did not match any items." />}
      />
      <Dialog open={isFormModalOpen} onOpenChange={(open) => { if (!open) setEditingItem(undefined); setIsFormModalOpen(open); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="sr-only">{editingItem ? "Edit Information" : "Add New Information"}</DialogTitle>
          <PracticalInfoForm mode={editingItem ? "edit" : "create"} initialData={editingItem} onSubmitAction={handleFormSubmit} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} item(s)</strong>.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
