"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useSession } from "next-auth/react";
import { organizationRepository } from "@/lib/data-repo/organization";
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
import { ProfileNav } from "@/components/organization/profile-nav";
import { toast } from "sonner";

interface OrganizationProfileClientProps {
  activeTab: string;
}

export function OrganizationProfileClient({
  activeTab,
}: OrganizationProfileClientProps) {
  const {
    activeOrganizationId,
    activeOrganizationDetails,
    isLoadingOrgDetails,
    fetchUserOrganizationsList,
  } = useActiveOrganization();
  const { data: session } = useSession();

  const [defaultAddress, setDefaultAddress] = useState<AddressDto | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  const fetchDefaultAddress = useCallback(async () => {
    if (activeOrganizationId) {
      setIsLoadingAddress(true);
      try {
        const addresses = await organizationRepository.getAddresses(
          "ORGANIZATION",
          activeOrganizationId
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
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    fetchDefaultAddress();
  }, [fetchDefaultAddress]);

  const handleUpdateSuccess = async (updatedOrg: OrganizationDto) => {
    toast.success(`Organization "${updatedOrg.short_name}" updated.`);
    if (session?.user.businessActorId) {
      await fetchUserOrganizationsList();
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
                Manage the physical locations and addresses for your
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
          <OrganizationForm
            mode="edit"
            initialData={activeOrganizationDetails}
            defaultAddress={defaultAddress}
            onSuccessAction={handleUpdateSuccess}
          />
        );
    }
  };

  if (isLoadingOrgDetails || isLoadingAddress) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 items-start">
          <main className="lg:col-span-5 order-2 lg:order-1">
            <Skeleton className="h-[600px] w-full" />
          </main>
          <aside className="lg:col-span-1 sticky top-20 order-1 lg:order-2 space-y-1">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </aside>
        </div>
      </div>
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
