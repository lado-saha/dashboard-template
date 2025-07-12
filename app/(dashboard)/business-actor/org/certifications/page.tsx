"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { CertificationDto, CreateCertificationRequest, UpdateCertificationRequest } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { CertificationForm } from "@/components/organization/certifications/certification-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Award, Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { getCertificationColumns } from "@/components/organization/certifications/columns";
import { CertificationCard } from "@/components/organization/certifications/certification-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";
import { FeedbackCard } from "@/components/ui/feedback-card";

const getCertificationTypeOptions = (items: CertificationDto[]): DataTableFilterOption[] => {
  const allTypes = items.map((item) => item.type).filter(Boolean);
  return [...new Set(allTypes)].map((type) => ({ label: String(type), value: String(type) })).sort((a, b) => a.label.localeCompare(b.label));
};

export default function ManageCertificationsPage() {
  const { activeOrganizationId, activeOrganizationDetails } = useActiveOrganization();

  const [editingItem, setEditingItem] = useState<CertificationDto | undefined>(undefined);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<CertificationDto[]>([]);
  const [allItems, setAllItems] = useState<CertificationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const derivedTypeOptions = useMemo(() => getCertificationTypeOptions(allItems), [allItems]);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) { setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationRepository.getCertifications(activeOrganizationId);
      setAllItems(data || []);
    } catch (err) {
      setError(err.message || "Could not load certifications.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => { fetchData(); }, [fetchData, dataVersion]);

  const refreshData = useCallback(() => setDataVersion((v) => v + 1), []);

  const handleFormSubmitAttempt = async (data: CreateCertificationRequest | UpdateCertificationRequest, certId?: string): Promise<boolean> => {
    if (!activeOrganizationId) { toast.error("No active organization selected."); return false; }
    try {
      const promise = certId
        ? organizationRepository.updateCertification(activeOrganizationId, certId, data as UpdateCertificationRequest)
        : organizationRepository.createCertification(activeOrganizationId, data as CreateCertificationRequest);
      
      await toast.promise(promise, {
        loading: `${certId ? 'Updating' : 'Creating'} certification...`,
        success: `Certification ${certId ? 'updated' : 'added'} successfully!`,
        error: (err) => err.message || "Failed to save certification."
      });

      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleOpenFormModal = (item?: CertificationDto) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: CertificationDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...allItems];
    const idsToDelete = itemsToDelete.map(item => item.certification_id!);
    setAllItems(prev => prev.filter(item => !idsToDelete.includes(item.certification_id!)));
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(itemsToDelete.map((item) => organizationRepository.deleteCertification(activeOrganizationId, item.certification_id!)));
    
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} certification(s)...`,
      success: () => {
        refreshData();
        setItemsToDelete([]);
        return `${itemsToDelete.length} certification(s) deleted.`;
      },
      error: (err) => {
        setAllItems(originalItems);
        setItemsToDelete([]);
        return `Failed to delete: ${err.message}`;
      },
    });
  };

  const columns = useMemo<ColumnDef<CertificationDto>[]>(
    () => getCertificationColumns({ onEditAction: handleOpenFormModal, onDeleteAction: (item) => handleDeleteConfirmation([item]) }), []
  );

  return (
    <>
      <ResourceDataTable
        data={allItems}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search by name, type..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="certifications-view-mode"
        exportFileName="certifications_export.csv"
        pageHeader={
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Certifications</h1>
              <p className="text-muted-foreground">Manage awards for <b>{activeOrganizationDetails?.long_name}</b></p>
            </div>
            <Button onClick={() => handleOpenFormModal()} size="sm" className="h-10">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </div>
        }
        filterControls={(table) => (
          derivedTypeOptions.length > 0 ? <DataTableFacetedFilter column={table.getColumn("type")} title="Type" options={derivedTypeOptions} /> : null
        )}
        renderGridItemAction={(item) => (
          <CertificationCard item={item} onEditAction={handleOpenFormModal} onDeleteAction={(item) => handleDeleteConfirmation([item])} />
        )}
        emptyState={
          <FeedbackCard
            icon={Award}
            title="No Certifications Added"
            description="Showcase your organization's qualifications by adding your first certification."
            actionButton={<Button onClick={() => handleOpenFormModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Certification</Button>}
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Certifications Found"
            description="Your search or filter criteria did not match any certifications."
          />
        }
      />

      <Dialog open={isFormModalOpen} onOpenChange={(open) => { if (!open) setEditingItem(undefined); setIsFormModalOpen(open); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Certification" : "Add New Certification"}</DialogTitle>
            <DialogDescription>{editingItem ? `Update details for "${editingItem?.name}"` : "Provide details for the new certification."}</DialogDescription>
          </DialogHeader>
          <CertificationForm initialData={editingItem} mode={editingItem ? "edit" : "create"} onSubmitAttemptAction={handleFormSubmitAttempt} onCancelAction={() => { setIsFormModalOpen(false); setEditingItem(undefined); }} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete <strong>{itemsToDelete.length} certification(s)</strong>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
