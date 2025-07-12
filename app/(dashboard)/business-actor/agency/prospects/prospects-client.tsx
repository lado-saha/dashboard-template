"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ProspectDto, CreateProspectRequest, UpdateProspectRequest } from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Lightbulb, Search as SearchIcon, Building } from "lucide-react";
import { getProspectColumns } from "@/components/organization/prospects/columns";
import { ProspectCard } from "@/components/organization/prospects/prospect-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProspectForm, ProspectFormData } from "@/components/organization/prospects/prospect-form";

export function AgencyProspectsClientPage() {
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails } = useActiveOrganization();
  const [prospects, setProspects] = useState<ProspectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<ProspectDto[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<ProspectDto | undefined>(undefined);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId) { setIsLoading(false); setProspects([]); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getAgencyProspects(activeOrganizationId, activeAgencyId);
      setProspects(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load agency prospects.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleOpenFormModal = (prospect?: ProspectDto) => {
    setEditingProspect(prospect);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: ProspectDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || !activeAgencyId || itemsToDelete.length === 0) return;
    const originalItems = [...prospects];
    const idsToDelete = itemsToDelete.map(item => item.prospect_id!);
    setProspects(prev => prev.filter(item => !idsToDelete.includes(item.prospect_id!)));
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(itemsToDelete.map(item => organizationRepository.deleteAgencyProspect(activeOrganizationId, activeAgencyId, item.prospect_id!)));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} prospect(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Prospect(s) deleted."; },
      error: (err) => { setProspects(originalItems); setItemsToDelete([]); return `Failed to delete: ${err.message}`; },
    });
  };

  const handleFormSubmit = async (data: ProspectFormData): Promise<boolean> => {
    if (!activeOrganizationId || !activeAgencyId) { toast.error("No active agency selected."); return false; }
    try {
      const promise = editingProspect?.prospect_id
        ? organizationRepository.updateAgencyProspect(activeOrganizationId, activeAgencyId, editingProspect.prospect_id, data as UpdateProspectRequest)
        : organizationRepository.createAgencyProspect(activeOrganizationId, activeAgencyId, data as CreateProspectRequest);
      
      await toast.promise(promise, {
        loading: `${editingProspect ? 'Updating' : 'Creating'} prospect...`,
        success: `Prospect ${editingProspect ? 'updated' : 'created'} successfully!`,
        error: (err) => err.message,
      });

      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const columns = useMemo<ColumnDef<ProspectDto>[]>(() => getProspectColumns({ onEditAction: handleOpenFormModal, onDeleteAction: (item) => handleDeleteConfirmation([item]) }, []), []);

  if (!activeAgencyId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Agency Selected" description="Please select an active agency to manage its prospects." />;
  }

  return (
    <>
      <ResourceDataTable
        data={prospects}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search agency prospects..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="agency-prospects-view-mode"
        exportFileName="agency_prospects.csv"
        pageHeader={<PageHeader title="Agency Prospects" description={`Manage prospects for ${activeAgencyDetails?.long_name}`} action={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Prospect</Button>} />}
        renderGridItemAction={(item) => <ProspectCard prospect={item} agencies={[]} onEditAction={handleOpenFormModal} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Lightbulb} title="No Prospects in this Agency" description="Add your first prospect to this agency." actionButton={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Prospect</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Prospects Found" description="Your search did not match any prospects in this agency." />}
      />
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">{editingProspect ? "Edit Prospect" : "Add New Prospect"}</DialogTitle>
          <ProspectForm mode={editingProspect ? "edit" : "create"} initialData={editingProspect} onSubmitAction={handleFormSubmit} agencies={[]} hideAgencySelector={true} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} prospect(s)</strong> from this agency.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
