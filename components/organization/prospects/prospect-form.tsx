"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProspectDto, AgencyDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const prospectFormSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  interest_level: z.string().optional(),
  agency_id: z.string().nullable().optional(),
});

export type ProspectFormData = z.infer<typeof prospectFormSchema>;

interface ProspectFormProps {
  initialData?: Partial<ProspectDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: ProspectFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  hideAgencySelector?: boolean;
}

export function ProspectForm({ initialData, mode, onSubmitAction, agencies, hideAgencySelector = false }: ProspectFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProspectFormData>({
    resolver: zodResolver(prospectFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      interest_level: initialData?.interest_level || "",
      agency_id: initialData?.agency_id || null,
    },
  });

  const handleSubmit = async (data: ProspectFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) setIsLoading(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === 'create' ? "Add New Prospect" : "Edit Prospect"}
      description="Manage potential customer information and their assignments."
      submitButtonText={mode === 'create' ? "Add Prospect" : "Save Changes"}
    >
      {() => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <FormField control={form.control} name="interest_level" render={({ field }) => (<FormItem><FormLabel>Interest Level</FormLabel><FormControl><Input placeholder="e.g., High, Warm, Cold" {...field} /></FormControl><FormMessage /></FormItem>)} />
          {!hideAgencySelector && (
            <FormField control={form.control} name="agency_id" render={({ field }) => (<FormItem><FormLabel>Agency Assignment</FormLabel><Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}><FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="headquarters">Headquarters</SelectItem>{agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
          )}
          <FormField control={form.control} name="long_description" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Add any relevant notes about this prospect..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      )}
    </FormWrapper>
  );
}
