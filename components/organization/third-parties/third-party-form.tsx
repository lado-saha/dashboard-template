"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ThirdPartyDto, ThirdPartyType, ThirdPartyTypeValues } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const thirdPartyFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  acronym: z.string().optional(),
  long_name: z.string().optional(),
  type: z.enum(ThirdPartyTypeValues, { required_error: "Third-party type is required." }),
  tax_number: z.string().optional(),
});

export type ThirdPartyFormData = z.infer<typeof thirdPartyFormSchema>;

interface ThirdPartyFormProps {
  initialData?: Partial<ThirdPartyDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: ThirdPartyFormData) => Promise<boolean>;
}

export function ThirdPartyForm({ initialData, mode, onSubmitAction }: ThirdPartyFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ThirdPartyFormData>({
    resolver: zodResolver(thirdPartyFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      acronym: initialData?.acronym || "",
      long_name: initialData?.long_name || "",
      type: initialData?.type || undefined,
      tax_number: initialData?.tax_number || "",
    },
  });

  const handleSubmit = async (data: ThirdPartyFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) setIsLoading(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === 'create' ? "Add New Third-Party" : "Edit Third-Party"}
      description="Manage information for your external partners and entities."
      submitButtonText={mode === 'create' ? "Add Third-Party" : "Save Changes"}
    >
      {() => (
        <div className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="e.g., Global Logistics" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={mode === 'edit'}><FormControl><SelectTrigger><SelectValue placeholder="Select a type..." /></SelectTrigger></FormControl><SelectContent>{ThirdPartyTypeValues.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="acronym" render={({ field }) => (<FormItem><FormLabel>Acronym</FormLabel><FormControl><Input placeholder="e.g., GL" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="tax_number" render={({ field }) => (<FormItem><FormLabel>Tax / VAT Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      )}
    </FormWrapper>
  );
}
