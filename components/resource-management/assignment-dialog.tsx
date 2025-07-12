"use client";

import React, { useState, useMemo } from "react";
import { Command, CommandDialog, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface AssignableItem {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
}

interface AssignmentDialogProps {
  title: string;
  description: string;
  itemsToAssign: AssignableItem[];
  alreadyAssignedIds: string[];
  onAssignAction: (selectedIds: string[]) => void;
  isLoading: boolean;
}

export function AssignmentDialog({ title, description, itemsToAssign, alreadyAssignedIds, onAssignAction, isLoading }: AssignmentDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const availableItems = useMemo(() => {
    const assignedSet = new Set(alreadyAssignedIds);
    return itemsToAssign.filter(item => !assignedSet.has(item.id));
  }, [itemsToAssign, alreadyAssignedIds]);

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleConfirmAssignment = () => {
    onAssignAction(Array.from(selectedIds));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Search by name..." />
        <ScrollArea className="h-[300px]">
          <CommandList>
            <CommandEmpty>No unassigned items found.</CommandEmpty>
            <CommandGroup>
              {availableItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.name} ${item.description}`}
                  onSelect={() => handleSelect(item.id)}
                  className="cursor-pointer"
                >
                  <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", selectedIds.has(item.id) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </ScrollArea>
      </Command>
      <DialogFooter>
        <Button
          onClick={handleConfirmAssignment}
          disabled={selectedIds.size === 0 || isLoading}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Assign Selected ({selectedIds.size})
        </Button>
      </DialogFooter>
    </>
  );
}