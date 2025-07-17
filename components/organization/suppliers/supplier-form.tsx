"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProviderDto, AgencyDto } from "@/types/organization";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/ui/image-uploader";
import { User, Building2, Truck } from "lucide-react";

const supplierFormSchema = z.object({
  first_name: z.string().min(2, "Supplier first name or company name is required."),
  last_name: z.string().optional().or(z.literal("")),
  product_service_type: z.string().min(3, "Please specify the type of product or service provided."),
  contact_info: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  short_description: z.string().max(100).optional().or(z.literal("")),
  long_description: z.string().max(500).optional().or(z.literal("")),
  agency_id: z.string().nullable().optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;

const formSteps = [
    { id: "details", name: "Supplier Details", icon: User, fields: ['first_name', 'last_name', 'logoFile', 'short_description', 'long_description'] },
    { id: "service", name: "Service & Assignment", icon: Truck, fields: ['product_service_type', 'agency_id', 'contact_info', 'address'] },
];

interface SupplierFormProps {
  initialData?: Partial<ProviderDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: SupplierFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  isLoading: boolean;
  scopedAgencyId?: string | null;
}

export function SupplierForm({ initialData, mode, onSubmitAction, agencies, isLoading, scopedAgencyId }: SupplierFormProps) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      product_service_type: initialData?.product_service_type || "",
      contact_info: initialData?.contact_info || "",
      address: initialData?.address || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
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
      title={mode === 'create' ? "Add New Supplier" : "Edit Supplier"}
      description="Manage information for your suppliers and vendors."
      submitButtonText={mode === 'create' ? "Create Supplier" : "Save Changes"}
    >
      {(currentStep) => (
          <div className="min-h-[350px]">
              {currentStep === 0 && (
                  <div className="space-y-6">
                      <FormField control={form.control} name="logoFile" render={({ field }) => (
                          <FormItem><FormLabel>Supplier Logo</FormLabel><FormControl><ImageUploader currentImageUrl={form.getValues("logo")} onImageSelectedAction={(file, url) => { field.onChange(file); form.setValue("logo", url || ""); }} label="Supplier Logo" aspectRatio="square" fallbackName={`${form.watch("first_name")} ${form.watch("last_name")}`} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name / Company *</FormLabel><FormControl><Input placeholder="e.g., John or ACME Inc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name (if applicable)</FormLabel><FormControl><Input placeholder="e.g., Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="short_description" render={({ field }) => (<FormItem><FormLabel>Tagline / Industry</FormLabel><FormControl><Input placeholder="e.g., Quality Raw Materials" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
              )}
              {currentStep === 1 && (
                   <div className="space-y-6">
                      <FormField control={form.control} name="product_service_type" render={({ field }) => (<FormItem><FormLabel>Primary Service/Product Type *</FormLabel><FormControl><Input placeholder="e.g., Office Supplies, SaaS Provider" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="contact_info" render={({ field }) => (<FormItem><FormLabel>Contact Info (Email/Phone)</FormLabel><FormControl><Input placeholder="supplier@email.com or +123456789" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Primary Address</FormLabel><FormControl><Textarea placeholder="123 Main St, Anytown, USA" {...field} /></FormControl><FormMessage /></FormItem>)} />

                      {scopedAgencyId === undefined && (
                          <FormField control={form.control} name="agency_id" render={({ field }) => (
                              <FormItem><FormLabel>Agency Assignment</FormLabel><Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}><FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="headquarters">Headquarters (No Agency)</SelectItem>{agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                          )} />
                      )}
                  </div>
              )}
          </div>
      )}
    </FormWrapper>
  );
}
