"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { OrganizationTableRow, OrganizationDto } from "@/types/organization";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, PlusCircle, Building } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

export function OrganizationSwitcher() {
  const {
    userOrganizations,
    activeOrganizationId,
    activeOrganizationDetails,
    setActiveOrganization,
    isLoadingUserOrgs,
  } = useActiveOrganization();
  const router = useRouter();

  const handleOrgChange = (orgId: string) => {
    if (orgId === "create_new_org") {
      router.push("/business-actor/organization/create");
    } else {
      const selectedOrg = userOrganizations.find(
        (org) => org.organization_id === orgId
      );
      if (selectedOrg) {
        setActiveOrganization(orgId, selectedOrg as OrganizationDto).then(
          () => {
            router.push(`/business-actor/organization/${orgId}/profile`);
          }
        );
      }
    }
  };

  if (isLoadingUserOrgs) {
    return <Skeleton className="h-10 w-full max-w-[200px]" />;
  }

  if (userOrganizations.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        asChild
        className="w-full justify-start text-left"
      >
        <Link href="/business-actor/organization/create">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Organization
        </Link>
      </Button>
    );
  }

  const currentOrgName =
    activeOrganizationDetails?.short_name ||
    userOrganizations.find(
      (org) => org.organization_id === activeOrganizationId
    )?.short_name ||
    "Select Organization";
  const currentOrgLogo =
    activeOrganizationDetails?.logo_url ||
    userOrganizations.find(
      (org) => org.organization_id === activeOrganizationId
    )?.logo_url;

  return (
    <div className="w-full px-2 py-2">
      <Select
        onValueChange={handleOrgChange}
        value={activeOrganizationId || ""}
      >
        <SelectTrigger className="w-full h-12 text-left justify-between hover:bg-muted/50 focus:ring-1 focus:ring-primary">
          <div className="flex items-center gap-2 min-w-0">
            {currentOrgLogo && currentOrgLogo !== "/placeholder.svg" ? (
              <Image
                src={currentOrgLogo}
                alt="Org"
                width={24}
                height={24}
                className="h-6 w-6 rounded object-cover"
              />
            ) : (
              <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <SelectValue placeholder="Select Organization...">
              <span className="truncate font-medium text-sm">
                {currentOrgName}
              </span>
            </SelectValue>
          </div>
          {/* <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50 flex-shrink-0" /> Icon is part of SelectTrigger now */}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="px-2 py-1.5 text-xs">
              Your Organizations
            </SelectLabel>
            {userOrganizations.map((org) => (
              <SelectItem
                key={org.organization_id}
                value={org.organization_id!}
                className="text-sm"
              >
                <div className="flex items-center gap-2">
                  {org.logo_url && org.logo_url !== "/placeholder.svg" ? (
                    <Image
                      src={org.logo_url}
                      alt="Org"
                      width={16}
                      height={16}
                      className="h-4 w-4 rounded-sm object-cover"
                    />
                  ) : (
                    <Building className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{org.short_name || org.long_name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup className="border-t mt-1 pt-1">
            <SelectItem
              value="create_new_org"
              className="text-sm text-primary hover:!bg-primary/10"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New Organization
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
