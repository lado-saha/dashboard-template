"use client";

import * as z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BusinessDomainDto } from "@/types/organization";

interface OrgBasicInfoFormProps {
  form: any; // React Hook Form's form object
  filteredDomains: BusinessDomainDto[];
  domainSearch: string;
  onDomainSearchChangeAction: (value: string) => void;
}

export function OrgBasicInfoForm({
  form,
  filteredDomains,
  domainSearch,
  onDomainSearchChangeAction,
}: OrgBasicInfoFormProps) {
  return (
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="long_name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Official Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="short_name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Name / Acronym *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        name="email"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Email *</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="description"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl>
              <Textarea rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="business_domains"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Domains *</FormLabel>
            <div className="border rounded-md p-2">
              <Input
                placeholder="Search domains..."
                className="mb-2 h-9"
                value={domainSearch}
                onChange={(e) => onDomainSearchChangeAction(e.target.value)}
              />
              <ScrollArea className="h-40">
                <div className="space-y-2 p-1">
                  {filteredDomains.map((domain) => (
                    <FormItem
                      key={domain.id}
                      className="flex flex-row items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value?.includes(domain.id!)}
                          onChange={(e) => {
                            const currentValues = field.value || [];
                            field.onChange(
                              e.target.checked
                                ? [...currentValues, domain.id!]
                                : currentValues.filter(
                                    (value: string) => value !== domain.id!
                                  )
                            );
                          }}
                          className="form-checkbox h-4 w-4 rounded"
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm cursor-pointer">
                        {domain.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  );
}
