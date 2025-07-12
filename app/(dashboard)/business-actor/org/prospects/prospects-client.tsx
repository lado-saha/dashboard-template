"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { ProspectDto, CreateProspectRequest, UpdateProspectRequest, AgencyDto } from "@/types/organization";
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
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

export function OrgProspectsClientPage() {
  const { activeOrganizationId, activeOrganizationDetails } = useActiveOrganization();
  const [prospects, setProspects] = useState<ProspectDto[]>([]);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<ProspectDto[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<ProspectDto | undefined>(undefined);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId) { setIsLoading(false); setProspects([]); return; }
    setIsLoading(true);
    setError(null);
    try {
      const [agenciesData, hqData] = await Promise.all([
        organizationRepository.getAgencies(activeOrganizationId),
        organizationRepository.getOrgProspects(activeOrganizationId)
      ]);
      setAgencies(agenciesData || []);
      const agencyPromises = (agenciesData || []).map(agency => organizationRepository.getAgencyProspects(activeOrganizationId, agency.agency_id!));
      const agencyResults = await Promise.all(agencyPromises);
      setProspects([...(hqData || []), ...agencyResults.flat()]);
    } catch (err: any) {
      setError(err.message || "Could not load prospect data.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

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
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...prospects];
    const idsToDelete = itemsToDelete.map(item => item.prospect_id!);
    setProspects(prev => prev.filter(item => !idsToDelete.includes(item.prospect_id!)));
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(itemsToDelete.map(item => item.agency_id
      ? organizationRepository.deleteAgencyProspect(activeOrganizationId, item.agency_id, item.prospect_id!)
      : organizationRepository.deleteOrgProspect(activeOrganizationId, item.prospect_id!)
    ));
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} prospect(s)...`,
      success: () => { refreshData(); setItemsToDelete([]); return "Prospect(s) deleted."; },
      error: (err) => { setProspects(originalItems); setItemsToDelete([]); return `Failed to delete: ${err.message}`; },
    });
  };

  const handleFormSubmit = async (data: ProspectFormData): Promise<boolean> => {
    if (!activeOrganizationId) { toast.error("No active organization."); return false; }
    const payload: CreateProspectRequest | UpdateProspectRequest = { ...data };
    try {
      let response: ProspectDto;
      if (editingProspect?.prospect_id) {
        response = await toast.promise(organizationRepository.updateOrgProspect(activeOrganizationId, editingProspect.prospect_id, payload as UpdateProspectRequest), { loading: 'Updating prospect...', success: 'Prospect updated!', error: (err) => err.message });
      } else {
        response = await toast.promise(organizationRepository.createOrgProspect(activeOrganizationId, payload as CreateProspectRequest), { loading: 'Creating prospect...', success: 'Prospect created!', error: (err) => err.message });
      }
      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const columns = useMemo<ColumnDef<ProspectDto>[]>(() => getProspectColumns({ onEditAction: handleOpenFormModal, onDeleteAction: (item) => handleDeleteConfirmation([item]) }, agencies), [agencies]);
  const agencyFilterOptions: DataTableFilterOption[] = useMemo(() => [{ value: "headquarters", label: "Headquarters" }, ...agencies.map(a => ({ value: a.agency_id!, label: a.short_name! }))], [agencies]);

  if (!activeOrganizationId && !isLoading) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an active organization to manage prospects." />;
  }

  return (
    <>
      <ResourceDataTable
        data={prospects}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search prospects..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-prospects-view-mode"
        exportFileName="organization_prospects.csv"
        pageHeader={<PageHeader title="Prospects" description={`Manage all prospects for ${activeOrganizationDetails?.long_name}`} action={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Prospect</Button>} />}
        filterControls={(table) => (<DataTableFacetedFilter column={table.getColumn("agency_id")} title="Agency" options={agencyFilterOptions} />)}
        renderGridItemAction={(item) => <ProspectCard prospect={item} agencies={agencies} onEditAction={handleOpenFormModal} onDeleteAction={(item) => handleDeleteConfirmation([item])} />}
        emptyState={<FeedbackCard icon={Lightbulb} title="No Prospects Yet" description="Add your first prospect to track potential leads." actionButton={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Prospect</Button>} />}
        filteredEmptyState={<FeedbackCard icon={SearchIcon} title="No Prospects Found" description="Your search did not match any prospects." />}
      />
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">{editingProspect ? "Edit Prospect" : "Add New Prospect"}</DialogTitle>
          <ProspectForm mode={editingProspect ? "edit" : "create"} initialData={editingProspect} onSubmitAction={handleFormSubmit} agencies={agencies} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} prospect(s)</strong>.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
