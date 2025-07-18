"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BusinessDomainSearchPicker } from "../forms/business-domain-search-picker";

export function AgencyBasicInfoForm() {
  const { control } = useFormContext();
  return (
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="long_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Official Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Yowyob West Coast Division"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="short_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Name / Branch Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Yowyob West" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., San Francisco, CA" {...field} />
            </FormControl>
            <FormDescription>
              A general location identifier (e.g., city, state).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                rows={4}
                placeholder="Describe the agency purpose or specialty."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <BusinessDomainSearchPicker
        name="business_domains"
        label="Business Domains *"
      />
      <FormField
        control={control}
        name="transferable"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Transferable</FormLabel>
              <FormDescription>
                Can resources/personnel be transferred from this agency?
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </CardContent>
  );
}
