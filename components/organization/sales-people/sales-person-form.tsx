"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SalesPersonDto, AgencyDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const salesPersonFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  commission_rate: z.coerce
    .number()
    .min(0, "Commission rate cannot be negative.")
    .optional(),
  agency_id: z.string().nullable().optional(),
});

export type SalesPersonFormData = z.infer<typeof salesPersonFormSchema>;

interface SalesPersonFormProps {
  initialData?: Partial<SalesPersonDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: SalesPersonFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  scopedAgencyId?: string | null;
  isLoading: boolean;
  // hideAgencySelector: boolean;
}

export function SalesPersonForm({
  initialData,
  mode,
  onSubmitAction,
  agencies,
  scopedAgencyId,
  isLoading,
}: SalesPersonFormProps) {
  const form = useForm<SalesPersonFormData>({
    resolver: zodResolver(salesPersonFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      commission_rate: initialData?.commission_rate || 0,
      agency_id:
        scopedAgencyId !== undefined
          ? scopedAgencyId
          : initialData?.agency_id || null,
    },
  });

  return (
    <FormWrapper
      form={form}
      onFormSubmit={onSubmitAction}
      isLoading={isLoading}
      title={mode === "create" ? "Add New Sales Person" : "Edit Sales Person"}
      description="Manage sales team members and their assignments."
      submitButtonText={mode === "create" ? "Add Sales Person" : "Save Changes"}
    >
      {() => (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="commission_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {scopedAgencyId === undefined && (
            <FormField
              control={form.control}
              name="agency_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agency Assignment</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "headquarters" ? null : value)
                    }
                    defaultValue={field.value || "headquarters"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to an agency..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="headquarters">Headquarters</SelectItem>
                      {agencies.map((agency) => (
                        <SelectItem
                          key={agency.agency_id}
                          value={agency.agency_id!}
                        >
                          {agency.long_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}
    </FormWrapper>
  );
}
