"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { BusinessDomainDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessDomainSearchPickerProps {
  name: string;
  label: string;
}

export function BusinessDomainSearchPicker({
  name,
  label,
}: BusinessDomainSearchPickerProps) {
  const { control } = useFormContext();
  const [availableDomains, setAvailableDomains] = useState<BusinessDomainDto[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsLoading(true);
    organizationRepository
      .getAllBusinessDomains()
      .then((data) => setAvailableDomains(data || []))
      .catch(() => setAvailableDomains([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredDomains = useMemo(() => {
    if (!searchTerm) return availableDomains;
    return availableDomains.filter((d) =>
      d.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, availableDomains]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="border rounded-md p-2">
            <Input
              placeholder="Search domains..."
              className="mb-2 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ScrollArea className="h-40">
              {isLoading ? (
                <div className="space-y-2 p-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-4/5" />
                </div>
              ) : (
                <div className="space-y-2 p-1">
                  {filteredDomains.map((domain) => (
                    <FormItem
                      key={domain.id}
                      className="flex flex-row items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(domain.id!)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            return checked
                              ? field.onChange([...currentValues, domain.id!])
                              : field.onChange(
                                  currentValues.filter(
                                    (value: string) => value !== domain.id!
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm cursor-pointer">
                        {domain.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
