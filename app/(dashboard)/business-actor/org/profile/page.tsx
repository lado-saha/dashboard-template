"use client";

import { useActiveOrganization } from "@/contexts/active-organization-context";
import { OrganizationForm } from "@/components/organization/organization-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactList } from "@/components/organization/contact-list";
import { AddressList } from "@/components/organization/address-list";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressDto, OrganizationDto } from "@/types/organization";
import { useSearchParams } from "next/navigation";
import { ProfileNav } from "@/components/organization/profile-nav";
import { useEffect, useState } from "react";
import { organizationRepository } from "@/lib/data-repo/organization";
import { toast } from "sonner";

export default function OrganizationProfilePage() {
  const {
    activeOrganizationId,
    activeOrganizationDetails,
    isLoadingOrgDetails,
    fetchAndSetOrganizationDetails,
  } = useActiveOrganization();

  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "edit_profile";
  const [defaultAddress, setDefaultAddress] = useState<AddressDto | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  // THE FIX: useEffect to fetch addresses when org details are available
  useEffect(() => {
    if (
      activeOrganizationDetails &&
      activeOrganizationDetails.organization_id
    ) {
      const fetchDefaultAddress = async () => {
        setIsLoadingAddress(true);
        try {
          const addresses = await organizationRepository.getAddresses(
            "ORGANIZATION",
            activeOrganizationDetails.organization_id!
          );
          const defaultAddr =
            addresses.find((addr) => addr.is_default) ||
            (addresses.length > 0 ? addresses[0] : null);
          setDefaultAddress(defaultAddr);
        } catch (error) {
          toast.error("Could not load organization's default address.");
        } finally {
          setIsLoadingAddress(false);
        }
      };
      fetchDefaultAddress();
    }
  }, [activeOrganizationDetails]);

  const handleUpdateSuccess = async (updatedData: OrganizationDto) => {
    if (activeOrganizationId) {
      await fetchAndSetOrganizationDetails(activeOrganizationId);
    }
  };

  const renderContent = () => {
    if (!activeOrganizationDetails) return null;

    switch (activeTab) {
      case "contacts":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Manage Contacts</CardTitle>
              <CardDescription>
                Add, edit, or remove contact persons for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactList
                organizationId={activeOrganizationDetails.organization_id!}
                contactableType="ORGANIZATION"
              />
            </CardContent>
          </Card>
        );
      case "addresses":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Manage Addresses</CardTitle>
              <CardDescription>
                Manage the physical locations and addresses associated with your
                organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddressList
                organizationId={activeOrganizationDetails.organization_id!}
                addressableType="ORGANIZATION"
              />
            </CardContent>
          </Card>
        );
      case "edit_profile":
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Edit Organization Details</CardTitle>
              <CardDescription>
                Modify your organization's core information. Changes are saved
                upon submission.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationForm
                mode="edit"
                initialData={activeOrganizationDetails}
                organizationId={activeOrganizationDetails.organization_id}
                onFormSubmitSuccessAction={handleUpdateSuccess}
                defaultAddress={defaultAddress}
              />
            </CardContent>
          </Card>
        );
    }
  };

  if (isLoadingOrgDetails || isLoadingAddress) {
    return (
      <div className="grid lg:grid-cols-6 gap-8">
        <div className="lg:col-span-5">
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!activeOrganizationDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Organization Selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please select an organization to view its profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Organization Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your organization's profile, addresses, and contacts.
        </p>
      </div>
      {/* THE FIX: Reordered for mobile-first, adjusted grid spans for large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 items-start">
        <main className="lg:col-span-5 order-2 lg:order-1">
          {renderContent()}
        </main>
        <aside className="lg:col-span-1 sticky top-20 order-1 lg:order-2">
          <ProfileNav activeTab={activeTab} />
        </aside>
      </div>
    </div>
  );
}
