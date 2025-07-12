"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProposedActivityDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(3, "Activity name is required."),
  type: z.string().min(3, "Activity type is required."),
  rate: z.coerce.number().min(0, "Rate must be a positive number.").optional(),
  description: z.string().optional(),
});

export type ProposedActivityFormData = z.infer<typeof formSchema>;

interface ProposedActivityFormProps {
  initialData?: Partial<ProposedActivityDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: ProposedActivityFormData) => Promise<boolean>;
}

export function ProposedActivityForm({ initialData, mode, onSubmitAction }: ProposedActivityFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProposedActivityFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      rate: initialData?.rate || 0,
      description: initialData?.description || "",
    },
  });

  const handleSubmit = async (data: ProposedActivityFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) setIsLoading(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === 'create' ? "Propose New Activity" : "Edit Activity"}
      description="Define a service or activity your organization offers."
      submitButtonText={mode === 'create' ? "Add Activity" : "Save Changes"}
    >
      {() => (
        <div className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Activity Name *</FormLabel><FormControl><Input placeholder="e.g., Business Consultation" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type *</FormLabel><FormControl><Input placeholder="e.g., Consulting, Workshop" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="rate" render={({ field }) => (<FormItem><FormLabel>Rate (USD)</FormLabel><FormControl><Input type="number" placeholder="e.g., 150.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the activity..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      )}
    </FormWrapper>
  );
}
