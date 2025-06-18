"use client";

import React, { useState } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronsUpDown, Building } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationSelectorDialog } from "./organization-selector-dialog";

export function OrganizationSwitcher() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    userOrganizations,
    activeOrganizationId,
    activeOrganizationDetails,
    isLoadingUserOrgs,
  } = useActiveOrganization();

  if (isLoadingUserOrgs) {
    return (
      <div className="px-2 py-2">
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  const activeOrg =
    activeOrganizationDetails ||
    userOrganizations.find(
      (org) => org.organization_id === activeOrganizationId
    );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="px-2 py-2">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isDialogOpen}
            className="w-full h-14 justify-between text-left hover:bg-muted/50 focus:ring-1 focus:ring-primary"
          >
            <div className="flex items-center gap-3 min-w-0">
              {activeOrg?.logo_url ? (
                <Image
                  src={activeOrg.logo_url}
                  alt="Org Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-md object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-col items-start min-w-0">
                <span className="truncate font-semibold text-sm">
                  {activeOrg?.short_name || "Select Organization"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeOrg
                    ? "Switch organization"
                    : "No organization selected"}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="p-0 gap-0 w-[100vw] h-[80vh] flex flex-col">
        <OrganizationSelectorDialog
          onCloseAction={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
