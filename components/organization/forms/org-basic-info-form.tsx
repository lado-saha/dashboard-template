"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardContent } from "@/components/ui/card";
import { BusinessDomainSearchPicker } from "./business-domain-search-picker";

export function OrgBasicInfoForm({ form }: { form: any }) {
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
      <BusinessDomainSearchPicker
        name="business_domains"
        label="Business Domains *"
      />
    </CardContent>
  );
}
