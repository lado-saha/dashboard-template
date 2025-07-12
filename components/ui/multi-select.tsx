"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem, CommandInput } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = "Select...", isLoading, className }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedSet = new Set(selected);

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  return (
    <Command className={cn("overflow-visible bg-transparent", className)}>
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return (
              <Badge key={value} variant="secondary">
                {option?.label || value}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => { if (e.key === "Enter") handleUnselect(value); }}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={() => handleUnselect(value)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandInput
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            className="flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {isLoading ? (
                <CommandItem disabled>Loading...</CommandItem>
              ) : (
                options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onSelect={() => {
                      onChange(selectedSet.has(option.value)
                        ? selected.filter((s) => s !== option.value)
                        : [...selected, option.value]
                      );
                      setOpen(true);
                    }}
                    className={"cursor-pointer"}
                  >
                    {option.label}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  );
}