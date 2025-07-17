"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SalesPersonDto, AgencyDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/ui/image-uploader";
import { User, Building2 } from "lucide-react";

// REASON: The schema was incorrect. It's now aligned with SalesPersonDto.
// It uses `name` instead of first/last, and includes all relevant fields.
const salesPersonFormSchema = z.object({
  name: z.string().min(2, "Full name is required."),
  short_description: z.string().max(100, "Title is too long.").optional().or(z.literal("")),
  commission_rate: z.coerce.number().min(0, "Rate must be non-negative.").optional().nullable(),
  credit: z.coerce.number().optional().nullable(),
  current_balance: z.coerce.number().optional().nullable(),
  agency_id: z.string().nullable().optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
});

export type SalesPersonFormData = z.infer<typeof salesPersonFormSchema>;

const formSteps = [
  { id: "details", name: "Sales Person Details", icon: User, fields: ['name', 'short_description', 'logoFile'] },
  { id: "assignment", name: "Assignment & Rates", icon: Building2, fields: ['agency_id', 'commission_rate', 'credit'] },
];

interface SalesPersonFormProps {
  initialData?: Partial<SalesPersonDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: SalesPersonFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  isLoading: boolean;
  scopedAgencyId?: string | null;
}

export function SalesPersonForm({ initialData, mode, onSubmitAction, agencies, isLoading, scopedAgencyId }: SalesPersonFormProps) {
  const form = useForm<SalesPersonFormData>({
    resolver: zodResolver(salesPersonFormSchema),
    defaultValues: {
      name: initialData?.name || `${initialData?.first_name || ''} ${initialData?.last_name || ''}`.trim(),
      short_description: initialData?.short_description || "",
      commission_rate: initialData?.commission_rate || null,
      credit: initialData?.credit || null,
      current_balance: initialData?.current_balance || null,
      agency_id: scopedAgencyId !== undefined ? scopedAgencyId : initialData?.agency_id || null,
      logo: initialData?.logo || "",
    },
  });

  return (
    <FormWrapper
      form={form}
      onFormSubmit={onSubmitAction}
      isLoading={isLoading}
      steps={formSteps}
      title={mode === 'create' ? "Create Sales Person" : "Edit Sales Person"}
      description="Fill in the details for the sales team member."
      submitButtonText={mode === 'create' ? "Create Sales Person" : "Save Changes"}
    >
      {(currentStep) => (
        <div className="min-h-[350px]">
          {currentStep === 0 && (
            <div className="space-y-6">
              <FormField control={form.control} name="logoFile" render={({ field }) => (
                <FormItem><FormLabel>Photo</FormLabel><FormControl><ImageUploader currentImageUrl={form.getValues("logo")} onImageSelectedAction={(file, url) => { field.onChange(file); form.setValue("logo", url || ""); }} label="Sales Person Photo" aspectRatio="square" fallbackName={form.watch("name")} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="short_description" render={({ field }) => (
                <FormItem><FormLabel>Title / Role</FormLabel><FormControl><Input placeholder="e.g., Senior Account Executive" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-6">
              <FormField control={form.control} name="commission_rate" render={({ field }) => (<FormItem><FormLabel>Commission Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="credit" render={({ field }) => (<FormItem><FormLabel>Credit Limit</FormLabel><FormControl><Input type="number" placeholder="e.g., 1000" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
              
              {scopedAgencyId === undefined && (
                <FormField control={form.control} name="agency_id" render={({ field }) => (
                  <FormItem><FormLabel>Agency Assignment</FormLabel><Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}><FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="headquarters">Headquarters</SelectItem>{agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                )} />
              )}
            </div>
          )}
        </div>
      )}
    </FormWrapper>
  );
}
