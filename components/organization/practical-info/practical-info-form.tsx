"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PracticalInformationDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const practicalInfoFormSchema = z.object({
  type: z.string().min(3, "Type must be at least 3 characters long.").max(100, "Type is too long."),
  value: z.string().min(1, "Value cannot be empty.").max(1000, "Value is too long."),
  notes: z.string().max(500, "Notes are too long.").optional().or(z.literal("")),
});

export type PracticalInfoFormData = z.infer<typeof practicalInfoFormSchema>;

interface PracticalInfoFormProps {
  initialData?: Partial<PracticalInformationDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: PracticalInfoFormData) => Promise<boolean>;
}

export function PracticalInfoForm({ initialData, mode, onSubmitAction }: PracticalInfoFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PracticalInfoFormData>({
    resolver: zodResolver(practicalInfoFormSchema),
    defaultValues: {
      type: initialData?.type || "",
      value: initialData?.value || "",
      notes: initialData?.notes || "",
    },
  });

  useEffect(() => {
    form.reset({
      type: initialData?.type || "",
      value: initialData?.value || "",
      notes: initialData?.notes || "",
    });
  }, [initialData, form.reset]);

  const handleSubmit = async (data: PracticalInfoFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) setIsLoading(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === 'create' ? "Add New Information" : "Edit Information"}
      description={mode === 'create' ? "Provide a new piece of practical information." : `Update details for "${initialData?.type}"`}
      submitButtonText={mode === 'create' ? "Add Information" : "Save Changes"}
    >
      {() => (
        <div className="space-y-6 p-1">
          <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Information Type *</FormLabel><FormControl><Input placeholder="e.g., Opening Hours, WiFi Password" {...field} /></FormControl><FormDescription>A clear category for this piece of information.</FormDescription><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="value" render={({ field }) => (<FormItem><FormLabel>Value / Content *</FormLabel><FormControl><Textarea placeholder="Enter the detailed information here..." {...field} rows={5} /></FormControl><FormDescription>The actual piece of information (e.g., Mon-Fri: 9 AM - 5 PM).</FormDescription><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Additional Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Any relevant context or extra details..." {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      )}
    </FormWrapper>
  );
}
