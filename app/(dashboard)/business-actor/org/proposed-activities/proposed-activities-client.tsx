"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ProposedActivityDto, CreateProposedActivityRequest, UpdateProposedActivityRequest } from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Activity, Search as SearchIcon, Building } from "lucide-react";
import { getProposedActivityColumns } from "@/components/organization/proposed-activities/columns";
import { ProposedActivityCard } from "@/components/organization/proposed-activities/proposed-activity-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProposedActivityForm, ProposedActivityFormData } from "@/components/organization/proposed-activities/proposed-activity-form";

export function OrgProposedActivitiesClientPage() {
  const { activeOrganizationId, activeOrganizationDetails } = useActiveOrganization();
  const [activities, setActivities] = useState<ProposedActivityDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<ProposedActivityDto[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProposedActivityDto | undefined>(undefined);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId) { setIsLoading(false); setActivities([]); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getProposedActivities(activeOrganizationId, { organizationId: activeOrganizationId });
      setActivities(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load proposed activities.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleOpenFormModal = (item?: ProposedActivityDto) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: ProposedActivityDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...activities];
    const idsToDelete = itemsToDelete.map(item => item.activity_id!);
    setActivities(prev => prev.filter(item => !idsToDelete.includes(item.activity_id!)));
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(itemsToDelete.map(item => organizationRepository.deleteProposedActivity(activeOrganizationId, item.activity_id!)));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} item(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Item(s) deleted."; },
      error: (err) => { setActivities(originalItems); setItemsToDelete([]); return `Failed to delete: ${err.message}`; },
    });
  };

  const handleFormSubmit = async (data: ProposedActivityFormData): Promise<boolean> => {
    if (!activeOrganizationId) { toast.error("No active organization."); return false; }
    try {
      const promise = editingItem?.activity_id
        ? organizationRepository.updateProposedActivity(activeOrganizationId, editingItem.activity_id, data as UpdateProposedActivityRequest)
        : organizationRepository.createProposedActivity(activeOrganizationId, data as CreateProposedActivityRequest);
      
      await toast.promise(promise, {
        loading: `${editingItem ? 'Updating' : 'Creating'} activity...`,
        success: `Activity ${editingItem ? 'updated' : 'created'} successfully!`,
        error: (err) => err.message,
      });

      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const columns = useMemo<ColumnDef<ProposedActivityDto>[]>(() => getProposedActivityColumns({ onEditAction: handleOpenFormModal, onDeleteAction: (item) => handleDeleteConfirmation([item]) }), []);

  if (!activeOrganizationId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an active organization to manage its proposed activities." />;
  }

  return (
    <>
      <ResourceDataTable
        data={activities}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search activities..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-proposed-activities-view-mode"
        exportFileName="proposed_activities.csv"
        pageHeader={<PageHeader title="Proposed Activities" description={`Manage the catalog of services for ${activeOrganizationDetails?.long_name}`} action={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Propose Activity</Button>} />}
        renderGridItemAction={(item) => <ProposedActivityCard activity={item} onEditAction={handleOpenFormModal} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Activity} title="No Activities Proposed Yet" description="Define the services and activities your organization offers to customers." actionButton={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Propose Activity</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Activities Found" description="Your search did not match any proposed activities." />}
      />
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">{editingItem ? "Edit Activity" : "Propose New Activity"}</DialogTitle>
          <ProposedActivityForm mode={editingItem ? "edit" : "create"} initialData={editingItem} onSubmitAction={handleFormSubmit} />
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
