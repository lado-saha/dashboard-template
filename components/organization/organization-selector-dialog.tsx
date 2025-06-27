"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { OrganizationDto, OrganizationTableRow } from "@/types/organization";
import { cn } from "@/lib/utils";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayoutGrid,
  List,
  Search,
  Building,
  Check,
  PlusCircle,
  Loader2,
  Briefcase,
} from "lucide-react";
import Image from "next/image";

interface OrganizationSelectorDialogProps {
  onCloseAction: () => void;
}

export function OrganizationSelectorDialog({
  onCloseAction,
}: OrganizationSelectorDialogProps) {
  const router = useRouter();
  const {
    userOrganizations,
    activeOrganizationId,
    setActiveOrganization,
    isLoadingUserOrgs,
  } = useActiveOrganization();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrganizations = useMemo(() => {
    if (!searchQuery) return userOrganizations;
    const lowercasedQuery = searchQuery.toLowerCase();
    return userOrganizations.filter(
      (org) =>
        org.long_name?.toLowerCase().includes(lowercasedQuery) ||
        org.short_name?.toLowerCase().includes(lowercasedQuery) ||
        org.email?.toLowerCase().includes(lowercasedQuery)
    );
  }, [userOrganizations, searchQuery]);

  const handleSelectAndClose = (org: OrganizationTableRow) => {
    if (!org.organization_id) return;
    setActiveOrganization(org.organization_id, org as OrganizationDto).then(
      () => {
        router.push(`/business-actor/org/dashboard`);
        onCloseAction();
      }
    );
  };

  const handleCreateNew = () => {
    router.push("/business-actor/organization/create");
    onCloseAction();
  };

  const NoOrganizationsPrompt = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-muted/50 rounded-lg">
      <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold">No Organizations Yet</h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
        It looks like you haven&apos;n created or joined an organization. Get started
        by creating your first one.
      </p>
      <Button onClick={handleCreateNew}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Your First Organization
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="px-6 pt-6 flex-shrink-0">
        <DialogTitle className="text-xl">Switch Organization</DialogTitle>
        <DialogDescription>
          Select an organization to manage or create a new one.
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 pt-4 pb-2 border-b flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange= {(e)  => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex items-center p-1 bg-muted rounded-lg w-full sm:w-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="flex-1 sm:flex-initial"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex-1 sm:flex-initial"
            >
              <List className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">List</span>
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-grow overflow-auto">
        <div className="p-6">
          {isLoadingUserOrgs ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrganizations.length === 0 && !searchQuery ? (
            <NoOrganizationsPrompt />
          ) : (
            <>
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOrganizations.map((org) => (
                    <Card
                      key={org.organization_id}
                      onClick={() => handleSelectAndClose(org)}
                      className={cn(
                        "cursor-pointer hover:shadow-lg transition-shadow hover:border-primary/50 relative group",
                        activeOrganizationId === org.organization_id &&
                          "border-2 border-primary shadow-lg"
                      )}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {org.logo_url ? (
                            <Image
                              src={org.logo_url}
                              alt="Logo"
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <Building className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <CardTitle className="text-base line-clamp-2">
                            {org.long_name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-xs line-clamp-2 min-h-[32px]">
                          {org.description}
                        </CardDescription>
                      </CardContent>
                      {activeOrganizationId === org.organization_id && (
                        <div className="absolute top-2 right-2 p-1 bg-primary text-primary-foreground rounded-full">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
              {viewMode === "list" && (
                <div className="space-y-2">
                  {filteredOrganizations.length > 0 ? (
                    filteredOrganizations.map((org) => (
                      <div
                        key={org.organization_id}
                        onClick={() => handleSelectAndClose(org)}
                        className={cn(
                          "flex items-center p-3 rounded-lg border hover:bg-accent cursor-pointer",
                          activeOrganizationId === org.organization_id &&
                            "bg-accent border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {org.logo_url ? (
                            <Image
                              src={org.logo_url}
                              alt="Logo"
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                              <Building className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {org.long_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {org.email}
                            </p>
                          </div>
                        </div>
                        {activeOrganizationId === org.organization_id && (
                          <Check className="ml-4 h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-10">
                      No organizations match your search.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <DialogFooter className="px-6 py-4 border-t flex-shrink-0 flex sm:justify-between">
        <DialogClose asChild>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={handleCreateNew} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </DialogFooter>
    </div>
  );
}
