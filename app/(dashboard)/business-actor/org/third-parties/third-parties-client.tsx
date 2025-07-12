"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ThirdPartyDto, ThirdPartyTypeValues } from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Search as SearchIcon, Building } from "lucide-react";
import { getThirdPartyColumns } from "@/components/organization/third-parties/columns";
import { ThirdPartyCard } from "@/components/organization/third-parties/third-party-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ThirdPartyForm, ThirdPartyFormData } from "@/components/organization/third-parties/third-party-form";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

const statusOptions: DataTableFilterOption[] = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const typeOptions: DataTableFilterOption[] = ThirdPartyTypeValues.map(t => ({ value: t, label: t }));

export function OrgThirdPartiesClientPage() {
  const { activeOrganizationId, activeOrganizationDetails } = useActiveOrganization();
  const [thirdParties, setThirdParties] = useState<ThirdPartyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<ThirdPartyDto[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ThirdPartyDto | undefined>(undefined);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId) { setIsLoading(false); setThirdParties([]); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getThirdParties(activeOrganizationId, {});
      setThirdParties(data || []);
    } catch (err: any) {
      setError(err.message || "Could not load third-party data.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleOpenFormModal = (item?: ThirdPartyDto) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: ThirdPartyDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...thirdParties];
    const idsToDelete = itemsToDelete.map(item => item.id!);
    setThirdParties(prev => prev.filter(item => !idsToDelete.includes(item.id!)));
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(itemsToDelete.map(item => organizationRepository.deleteThirdParty(activeOrganizationId, item.id!)));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} item(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Item(s) deleted."; },
      error: (err) => { setThirdParties(originalItems); setItemsToDelete([]); return `Failed to delete: ${err.message}`; },
    });
  };

  const handleFormSubmit = async (data: ThirdPartyFormData): Promise<boolean> => {
    if (!activeOrganizationId) { toast.error("No active organization."); return false; }
    try {
      const promise = editingItem?.id
        ? organizationRepository.updateThirdParty(activeOrganizationId, editingItem.id, data)
        : organizationRepository.createThirdParty(activeOrganizationId, data.type, data);
      
      await toast.promise(promise, {
        loading: `${editingItem ? 'Updating' : 'Creating'} third-party...`,
        success: `Third-party ${editingItem ? 'updated' : 'created'} successfully!`,
        error: (err) => err.message,
      });

      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const columns = useMemo<ColumnDef<ThirdPartyDto>[]>(() => getThirdPartyColumns({ onEditAction: handleOpenFormModal, onDeleteAction: (item) => handleDeleteConfirmation([item]) }), []);

  if (!activeOrganizationId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an active organization to manage third-parties." />;
  }

  return (
    <>
      <ResourceDataTable
        data={thirdParties}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search by name..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-third-parties-view-mode"
        exportFileName="organization_third_parties.csv"
        pageHeader={<PageHeader title="Third-Parties" description={`Manage external partners for ${activeOrganizationDetails?.long_name}`} action={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Third-Party</Button>} />}
        filterControls={(table) => (
          <>
            <DataTableFacetedFilter column={table.getColumn("is_active")} title="Status" options={statusOptions} />
            <DataTableFacetedFilter column={table.getColumn("type")} title="Type" options={typeOptions} />
          </>
        )}
        renderGridItemAction={(item) => <ThirdPartyCard thirdParty={item} onEditAction={handleOpenFormModal} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Briefcase} title="No Third-Parties Yet" description="Add your first external partner, supplier, or other entity." actionButton={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Third-Party</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Third-Parties Found" description="Your search did not match any partners." />}
      />
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">{editingItem ? "Edit Third-Party" : "Add New Third-Party"}</DialogTitle>
          <ThirdPartyForm mode={editingItem ? "edit" : "create"} initialData={editingItem} onSubmitAction={handleFormSubmit} />
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
