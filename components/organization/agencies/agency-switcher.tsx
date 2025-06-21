"use client";

import React, { useState } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronsUpDown, Building } from "lucide-react";
import Image from "next/image";
import { AgencySelectorDialog } from "./agency-selector-dialog";

interface AgencySwitcherProps {
  isCollapsed: boolean;
}

export function AgencySwitcher({ isCollapsed }: AgencySwitcherProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { activeAgencyDetails } = useActiveOrganization();

  if (isCollapsed) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {activeAgencyDetails?.logo ? (
                    <Image
                      src={activeAgencyDetails.logo}
                      alt="Agency Logo"
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-md object-cover"
                    />
                  ) : (
                    <Building className="h-5 w-5" />
                  )}
                  <span className="sr-only">Switch Agency</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              {activeAgencyDetails?.short_name || "Switch Agency"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DialogContent className="p-0 gap-0 w-[95vw] max-w-md h-[70vh] flex flex-col">
          <AgencySelectorDialog onCloseAction={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

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
              {activeAgencyDetails?.logo ? (
                <Image
                  src={activeAgencyDetails.logo}
                  alt="Agency Logo"
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
                  {activeAgencyDetails?.short_name || "Select Agency"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Switch agency
                </span>
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="p-0 gap-0 w-[95vw] max-w-md h-[70vh] flex flex-col">
        <AgencySelectorDialog onCloseAction={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
