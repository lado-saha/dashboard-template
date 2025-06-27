"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { AgencyDto } from "@/types/organization";
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
  Search,
  Building,
  Check,
  PlusCircle,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import Image from "next/image";

interface AgencySelectorDialogProps {
  onCloseAction: () => void;
}

export function AgencySelectorDialog({
  onCloseAction,
}: AgencySelectorDialogProps) {
  const router = useRouter();
  const {
    agenciesForCurrentOrg,
    activeAgencyId,
    setActiveAgency,
    isLoadingAgencies,
  } = useActiveOrganization();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgencies = useMemo(() => {
    if (!searchQuery) return agenciesForCurrentOrg;
    const lowercasedQuery = searchQuery.toLowerCase();
    return agenciesForCurrentOrg.filter(
      (agency) =>
        agency.long_name?.toLowerCase().includes(lowercasedQuery) ||
        agency.short_name?.toLowerCase().includes(lowercasedQuery)
    );
  }, [agenciesForCurrentOrg, searchQuery]);

  const handleSelectAndClose = (agency: AgencyDto) => {
    if (!agency.agency_id) return;
    setActiveAgency(agency.agency_id, agency);
    onCloseAction();
  };

  const handleCreateNew = () => {
    router.push("/business-actor/org/agencies/create");
    onCloseAction();
  };

  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="px-6 pt-6 flex-shrink-0">
        <DialogTitle className="text-xl">Switch Agency</DialogTitle>
        <DialogDescription>
          Select an agency to manage within this organization.
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 pt-4 pb-2 border-b flex-shrink-0 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agencies..."
            value={searchQuery}
            onChange={(e: any)  => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex items-center p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-grow overflow-auto">
        <div className="p-6">
          {isLoadingAgencies ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredAgencies.map((agency) => (
                <Card
                  key={agency.agency_id}
                  onClick={() => handleSelectAndClose(agency)}
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-shadow relative group",
                    activeAgencyId === agency.agency_id &&
                      "border-2 border-primary"
                  )}
                >
                  <CardHeader className="p-4 flex flex-col items-center text-center">
                    {agency.logo ? (
                      <Image
                        src={agency.logo}
                        alt="Logo"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-cover mb-2"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                        <Building className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <CardTitle className="text-sm font-semibold line-clamp-1">
                      {agency.short_name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-1">
                      {agency.location}
                    </CardDescription>
                  </CardHeader>
                  {activeAgencyId === agency.agency_id && (
                    <div className="absolute top-1 right-1 p-0.5 bg-primary text-primary-foreground rounded-full">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAgencies.map((agency) => (
                <div
                  key={agency.agency_id}
                  onClick={() => handleSelectAndClose(agency)}
                  className={cn(
                    "flex items-center p-3 rounded-lg border hover:bg-accent cursor-pointer",
                    activeAgencyId === agency.agency_id &&
                      "bg-accent border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {agency.logo ? (
                      <Image
                        src={agency.logo}
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
                        {agency.long_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {agency.location}
                      </p>
                    </div>
                  </div>
                  {activeAgencyId === agency.agency_id && (
                    <Check className="ml-4 h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
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
          <PlusCircle className="mr-2 h-4 w-4" /> Create Agency
        </Button>
      </DialogFooter>
    </div>
  );
}
