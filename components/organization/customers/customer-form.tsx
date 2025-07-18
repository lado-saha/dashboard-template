"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CustomerDto, AgencyDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/ui/image-uploader";
import { User, Building2, DollarSign } from "lucide-react";

const customerFormSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  short_description: z.string().max(100, "Title is too long.").optional().or(z.literal("")),
  long_description: z.string().max(500, "Notes are too long.").optional().or(z.literal("")),
  agency_id: z.string().nullable().optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
  payment_method: z.string().optional().or(z.literal("")),
  amount_paid: z.string().optional().or(z.literal("")),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

const formSteps = [
    { id: "details", name: "Customer Details", icon: User, fields: ['first_name', 'last_name', 'logoFile', 'short_description', 'long_description'] },
    { id: "assignment", name: "Assignment & Financials", icon: Building2, fields: ['agency_id', 'payment_method', 'amount_paid'] },
];

interface CustomerFormProps {
  initialData?: Partial<CustomerDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: CustomerFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  isLoading: boolean;
}

export function CustomerForm({ initialData, mode, onSubmitAction, agencies, isLoading }: CustomerFormProps) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      agency_id: initialData?.agency_id || null,
      logo: initialData?.logo || "",
      payment_method: initialData?.payment_method || "",
      amount_paid: initialData?.amount_paid || "",
    },
  });

  return (
    <FormWrapper
      form={form}
      onFormSubmit={onSubmitAction}
      isLoading={isLoading}
      steps={formSteps}
      title={mode === 'create' ? "Add New Customer" : "Edit Customer"}
      description="Manage customer information and their assignments."
      submitButtonText={mode === 'create' ? "Add Customer" : "Save Changes"}
    >
      {(currentStep) => (
          <div className="min-h-[400px]">
              {currentStep === 0 && (
                  <div className="space-y-6">
                      <FormField control={form.control} name="logoFile" render={({ field }) => (
                          <FormItem><FormLabel>Customer Photo</FormLabel><FormControl><ImageUploader currentImageUrl={form.getValues("logo")} onImageSelectedAction={(file, url) => { field.onChange(file); form.setValue("logo", url || ""); }} label="Customer Photo" aspectRatio="square" fallbackName={`${form.watch("first_name")} ${form.watch("last_name")}`} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input placeholder="Jane" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="long_description" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Add any relevant notes about this customer..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
              )}
              {currentStep === 1 && (
                   <div className="space-y-6">
                       <FormField control={form.control} name="agency_id" render={({ field }) => (
                          <FormItem><FormLabel>Agency Assignment</FormLabel><Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}><FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="headquarters">Headquarters (No Agency)</SelectItem>{agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                       )} />
                       <FormField control={form.control} name="payment_method" render={({ field }) => (<FormItem><FormLabel>Last Payment Method</FormLabel><FormControl><Input placeholder="e.g., Credit Card" {...field} /></FormControl><FormMessage /></FormItem>)} />
                       <FormField control={form.control} name="amount_paid" render={({ field }) => (<FormItem><FormLabel>Last Amount Paid</FormLabel><FormControl><Input type="text" placeholder="e.g., 150.00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                   </div>
              )}
          </div>
      )}
    </FormWrapper>
  );
}
