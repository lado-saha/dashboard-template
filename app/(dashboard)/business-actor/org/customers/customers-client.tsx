"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  CustomerDto,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  AgencyDto,
} from "@/types/organization";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Users,
  Search as SearchIcon,
  Building,
} from "lucide-react";
import { getCustomerColumns } from "@/components/organization/customers/columns";
import { CustomerCard } from "@/components/organization/customers/customer-card";
import { ResourceDataTable } from "@/components/resource-management/resource-data-table";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { PageHeader } from "@/components/ui/page-header";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  CustomerForm,
  CustomerFormData,
} from "@/components/organization/customers/customer-form";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableFilterOption } from "@/types/table";

export function CustomersClientPage() {
  const { activeOrganizationId, activeOrganizationDetails } =
    useActiveOrganization();
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<CustomerDto[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<
    CustomerDto | undefined
  >(undefined);

  const refreshData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsLoading(false);
      setCustomers([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // [CHANGE] Fetch agencies and all customers in parallel
      const [agenciesData, hqCustomersData] = await Promise.all([
        organizationRepository.getAgencies(activeOrganizationId),
        organizationRepository.getOrgCustomers(activeOrganizationId),
      ]);
      setAgencies(agenciesData || []);

      const agencyCustomerPromises = (agenciesData || []).map((agency) =>
        organizationRepository.getAgencyCustomers(
          activeOrganizationId,
          agency.agency_id!
        )
      );
      const allAgencyCustomersNested = await Promise.all(
        agencyCustomerPromises
      );
      const allAgencyCustomers = allAgencyCustomersNested.flat();

      setCustomers([...(hqCustomersData || []), ...allAgencyCustomers]);
    } catch (err: any) {
      setError(err.message || "Could not load customer data.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleOpenFormModal = (customer?: CustomerDto) => {
    setEditingCustomer(customer);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (items: CustomerDto[]) => {
    if (items.length === 0) return;
    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!activeOrganizationId || itemsToDelete.length === 0) return;
    const originalItems = [...customers];
    const idsToDelete = itemsToDelete.map((item) => item.customer_id!);
    setCustomers((prev) =>
      prev.filter((item) => !idsToDelete.includes(item.customer_id!))
    );
    setIsDeleteDialogOpen(false);

    const promise = Promise.all(
      itemsToDelete.map((item) => {
        if (item.agency_id) {
          return organizationRepository.deleteAgencyCustomer(
            activeOrganizationId,
            item.agency_id,
            item.customer_id!
          );
        }
        return organizationRepository.deleteOrgCustomer(
          activeOrganizationId,
          item.customer_id!
        );
      })
    );
    toast.promise(promise, {
      loading: `Deleting ${itemsToDelete.length} customer(s)...`,
      success: () => {
        refreshData();
        setItemsToDelete([]);
        return "Customer(s) deleted.";
      },
      error: (err) => {
        setCustomers(originalItems);
        setItemsToDelete([]);
        return `Failed to delete: ${err.message}`;
      },
    });
  };

  const handleFormSubmit = async (data: CustomerFormData): Promise<boolean> => {
    if (!activeOrganizationId) {
      toast.error("No active organization.");
      return false;
    }

    const customerPayload: CreateCustomerRequest | UpdateCustomerRequest = {
      first_name: data.first_name,
      last_name: data.last_name,
      short_description: data.short_description,
      long_description: data.long_description,
    };

    try {
      let customerResponse: CustomerDto;
      if (editingCustomer?.customer_id) {
        // --- EDIT LOGIC ---
        const updatePromise = organizationRepository.updateOrgCustomer(
          activeOrganizationId,
          editingCustomer.customer_id,
          customerPayload as UpdateCustomerRequest
        );
        toast.promise(updatePromise, {
          loading: "Updating customer details...",
          success: "Customer updated!",
          error: (err) => err.message,
        });
        customerResponse = await updatePromise;
        // Check if agency assignment changed
        if (data.agency_id !== editingCustomer.agency_id) {
          if (data.agency_id) {
            // Assigning to a new agency
            await toast.promise(
              organizationRepository.affectCustomerToAgency(
                activeOrganizationId,
                data.agency_id,
                { customer_id: editingCustomer.customer_id }
              ),
              {
                loading: `Assigning to agency...`,
                success: "Assigned to new agency!",
                error: (err) => err.message,
              }
            );
          } else {
            // This implies moving back to HQ. The API spec doesn't have an "un-affect" endpoint.
            // Often, affecting to a special "HQ" ID or simply updating the main record would handle this.
            // For now, we assume affecting handles re-assignment and we'll need a way to un-assign.
            toast.info(
              "Moving customer to Headquarters (un-affect logic to be confirmed)."
            );
          }
        }
      } else {
        // --- CREATE LOGIC ---
        customerResponse = await toast
          .promise(
            organizationRepository.createOrgCustomer(
              activeOrganizationId,
              customerPayload as CreateCustomerRequest
            ),
            {
              loading: "Creating customer...",
              success: "Customer created!",
              error: (err) => err.message,
            }
          )
          .unwrap();
        // If an agency was selected during creation, affect the new customer to it
        if (data.agency_id && customerResponse.customer_id) {
          await toast.promise(
            organizationRepository.affectCustomerToAgency(
              activeOrganizationId,
              data.agency_id,
              { customer_id: customerResponse.customer_id }
            ),
            {
              loading: `Assigning to agency...`,
              success: "Assigned to agency!",
              error: (err) => err.message,
            }
          );
        }
      }
      refreshData();
      setIsFormModalOpen(false);
      return true;
    } catch (error) {
      return false;
    }
  };

  const columns = useMemo<ColumnDef<CustomerDto>[]>(
    () =>
      getCustomerColumns(
        {
          onEditAction: handleOpenFormModal,
          onDeleteAction: (item) => handleDeleteConfirmation([item]),
        },
        agencies
      ),
    [agencies]
  );

  const agencyFilterOptions: DataTableFilterOption[] = useMemo(
    () => [
      { value: "headquarters", label: "Headquarters" },
      ...agencies.map((a) => ({ value: a.agency_id!, label: a.short_name! })),
    ],
    [agencies]
  );

  if (!activeOrganizationId && !isLoading) {
    return (
      <FeedbackCard
        icon={Building}
        title="No Organization Selected"
        description="Please select an active organization to manage customers."
      />
    );
  }

  return (
    <>
      <ResourceDataTable
        data={customers}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefreshAction={refreshData}
        searchPlaceholder="Search customers..."
        onDeleteItemsAction={handleDeleteConfirmation}
        viewModeStorageKey="org-customers-view-mode"
        exportFileName="organization_customers.csv"
        pageHeader={
          <PageHeader
            title="Customers"
            description={`Manage all customers for ${
              activeOrganizationDetails?.long_name || "your organization"
            }`}
            action={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            }
          />
        }
        filterControls={(table) => (
          <DataTableFacetedFilter
            column={table.getColumn("agency_id")}
            title="Agency"
            options={agencyFilterOptions}
          />
        )}
        renderGridItemAction={(customer) => (
          <CustomerCard
            customer={customer}
            agencies={agencies}
            onEditAction={handleOpenFormModal}
            onDeleteAction={(item) => handleDeleteConfirmation([item])}
          />
        )}
        emptyState={
          <FeedbackCard
            icon={Users}
            title="No Customers Yet"
            description="Add your first customer to start managing your client relationships."
            actionButton={
              <Button onClick={() => handleOpenFormModal()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            }
          />
        }
        filteredEmptyState={
          <FeedbackCard
            icon={SearchIcon}
            title="No Customers Found"
            description="Your search did not match any customers."
          />
        }
      />
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogTitle className="sr-only">
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
          <CustomerForm
            mode={editingCustomer ? "edit" : "create"}
            initialData={editingCustomer}
            onSubmitAction={handleFormSubmit}
            agencies={agencies}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{itemsToDelete.length} customer(s)</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
