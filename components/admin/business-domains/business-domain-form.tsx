"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BusinessDomainDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(3, "Domain name is required."),
  type: z.string().min(2, "Type code is required (e.g., TECH)."),
  type_label: z.string().min(3, "Type label is required (e.g., Technology)."),
  description: z.string().optional(),
  image: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
});

export type BusinessDomainFormData = z.infer<typeof formSchema>;

interface BusinessDomainFormProps {
  initialData?: Partial<BusinessDomainDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: BusinessDomainFormData) => Promise<boolean>;
}

export function BusinessDomainForm({ initialData, mode, onSubmitAction }: BusinessDomainFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BusinessDomainFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      type_label: initialData?.type_label || "",
      description: initialData?.description || "",
      image: initialData?.image || "",
    },
  });

  const handleSubmit = async (data: BusinessDomainFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) setIsLoading(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === 'create' ? "Create Business Domain" : "Edit Business Domain"}
      description="Manage the categories that organizations can operate within."
      submitButtonText={mode === 'create' ? "Create Domain" : "Save Changes"}
    >
      {() => (
        <div className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Domain Name *</FormLabel><FormControl><Input placeholder="e.g., Technology & Software" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type Code *</FormLabel><FormControl><Input placeholder="e.g., TECH" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="type_label" render={({ field }) => (<FormItem><FormLabel>Type Label *</FormLabel><FormControl><Input placeholder="e.g., Technology" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <FormField control={form.control} name="image" render={({ field }) => (<FormItem><FormLabel>Icon URL</FormLabel><FormControl><Input type="url" placeholder="https://example.com/icon.png" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe this business domain..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      )}
    </FormWrapper>
  );
}