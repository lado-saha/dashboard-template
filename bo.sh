#!/bin/bash

# --- Sales People Form Overhaul ---
# Creates a new, comprehensive form that matches the SalesPersonDto.
# This fixes the bug where names and other details were not being handled correctly.
echo "Overhauling SalesPerson form..."
mkdir -p components/organization/sales-people
cat << 'EOF' > components/organization/sales-people/sales-person-form.tsx
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

// CORRECTED: Schema now reflects the full SalesPersonDto for a complete form.
const salesPersonFormSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  short_description: z.string().optional().or(z.literal("")),
  long_description: z.string().max(500, "Description is too long.").optional().or(z.literal("")),
  commission_rate: z.coerce.number().min(0, "Rate must be non-negative.").optional(),
  agency_id: z.string().nullable().optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
});

export type SalesPersonFormData = z.infer<typeof salesPersonFormSchema>;

interface SalesPersonFormProps {
  initialData?: Partial<SalesPersonDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: SalesPersonFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  hideAgencySelector?: boolean;
}

export function SalesPersonForm({ initialData, mode, onSubmitAction, agencies, hideAgencySelector = false }: SalesPersonFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SalesPersonFormData>({
    resolver: zodResolver(salesPersonFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      commission_rate: initialData?.commission_rate || undefined,
      agency_id: initialData?.agency_id || null,
      logo: initialData?.logo || "",
    },
  });

  const handleSubmit = async (data: SalesPersonFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) setIsLoading(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === 'create' ? "Add New Sales Person" : "Edit Sales Person"}
      description="Manage sales team members and their assignments."
      submitButtonText={mode === 'create' ? "Add Sales Person" : "Save Changes"}
    >
      {() => (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="logoFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo</FormLabel>
                <FormControl>
                  <ImageUploader
                    currentImageUrl={form.getValues("logo")}
                    onImageSelectedAction={(file, url) => {
                      field.onChange(file);
                      form.setValue("logo", url || "");
                    }}
                    label="Sales Person Photo"
                    aspectRatio="square"
                    fallbackName={`${form.watch("first_name")} ${form.watch("last_name")}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input placeholder="Jane" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input placeholder="Smith" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <FormField control={form.control} name="short_description" render={({ field }) => (<FormItem><FormLabel>Title / Role</FormLabel><FormControl><Input placeholder="e.g., Senior Account Executive" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="commission_rate" render={({ field }) => (<FormItem><FormLabel>Commission Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} /></FormControl><FormMessage /></FormItem>)} />
          {!hideAgencySelector && (
            <FormField
              control={form.control}
              name="agency_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agency Assignment</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="headquarters">Headquarters</SelectItem>
                      {agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField control={form.control} name="long_description" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Add any relevant notes..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      )}
    </FormWrapper>
  );
}
EOF
code components/organization/sales-people/sales-person-form.tsx

# --- Supplier Form Overhaul ---
# Expands the supplier form with a schema that matches the ProviderDto.
echo "Overhauling Supplier form..."
mkdir -p components/organization/suppliers
cat << 'EOF' > components/organization/suppliers/supplier-form.tsx
"use client";

import React, { useState } from "react";
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

// CORRECTED: Schema now aligns with the CreateProviderRequest and ProviderDto
const supplierFormSchema = z.object({
  first_name: z.string().min(2, "First name or company name is required."),
  last_name: z.string().optional().or(z.literal("")),
  product_service_type: z.string().min(3, "Service type is required (e.g., Raw Materials, Logistics)."),
  short_description: z.string().max(100, "Tagline is too long.").optional().or(z.literal("")),
  long_description: z.string().max(500, "Notes are too long.").optional().or(z.literal("")),
  contact_info: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  agency_id: z.string().nullable().optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  initialData?: Partial<ProviderDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: SupplierFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  hideAgencySelector?: boolean;
}

export function SupplierForm({ initialData, mode, onSubmitAction, agencies, hideAgencySelector = false }: SupplierFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      product_service_type: initialData?.product_service_type || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      contact_info: initialData?.contact_info || "",
      address: initialData?.address || "",
      agency_id: initialData?.agency_id || null,
      logo: initialData?.logo || "",
    },
  });

  const handleSubmit = async (data: SupplierFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) setIsLoading(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === 'create' ? "Add New Supplier" : "Edit Supplier"}
      description="Manage supplier information and their assignments."
      submitButtonText={mode === 'create' ? "Add Supplier" : "Save Changes"}
    >
      {() => (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="logoFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Logo</FormLabel>
                <FormControl>
                  <ImageUploader
                    currentImageUrl={form.getValues("logo")}
                    onImageSelectedAction={(file, url) => { field.onChange(file); form.setValue("logo", url || ""); }}
                    label="Supplier Logo"
                    aspectRatio="square"
                    fallbackName={`${form.watch("first_name")} ${form.watch("last_name")}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name / Company *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name (if applicable)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <FormField control={form.control} name="product_service_type" render={({ field }) => (<FormItem><FormLabel>Primary Service/Product Type *</FormLabel><FormControl><Input placeholder="e.g., Office Supplies, SaaS Provider" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="contact_info" render={({ field }) => (<FormItem><FormLabel>Contact Info (Email/Phone)</FormLabel><FormControl><Input placeholder="supplier@email.com or +123456789" {...field} /></FormControl><FormMessage /></FormItem>)} />
          {!hideAgencySelector && (
            <FormField control={form.control} name="agency_id" render={({ field }) => (<FormItem><FormLabel>Agency Assignment</FormLabel><Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}><FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="headquarters">Headquarters (No Agency)</SelectItem>{agencies.map((agency) => (<SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
          )}
          <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Primary Address</FormLabel><FormControl><Textarea placeholder="123 Main St, Anytown, USA" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      )}
    </FormWrapper>
  );
}
EOF
code components/organization/suppliers/supplier-form.tsx

# --- Customer Form Overhaul ---
# Expands the customer form for completeness, matching its DTO.
echo "Overhauling Customer form..."
mkdir -p components/organization/customers
cat << 'EOF' > components/organization/customers/customer-form.tsx
"use client";

import React, { useState } from "react";
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

// CORRECTED: Expanded schema to match DTO more closely
const customerFormSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  short_description: z.string().max(100, "Title is too long.").optional().or(z.literal("")),
  long_description: z.string().max(500, "Notes are too long.").optional().or(z.literal("")),
  agency_id: z.string().nullable().optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  initialData?: Partial<CustomerDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: CustomerFormData) => Promise<boolean>;
  agencies: AgencyDto[];
  hideAgencySelector?: boolean;
}

export function CustomerForm({ initialData, mode, onSubmitAction, agencies, hideAgencySelector = false }: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      agency_id: initialData?.agency_id || null,
      logo: initialData?.logo || "",
    },
  });

  const handleSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) {
      setIsLoading(false);
    }
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === 'create' ? "Add New Customer" : "Edit Customer"}
      description="Manage customer information for your organization."
      submitButtonText={mode === 'create' ? "Add Customer" : "Save Changes"}
    >
      {() => (
        <div className="space-y-6">
           <FormField
            control={form.control}
            name="logoFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Photo/Logo</FormLabel>
                <FormControl>
                  <ImageUploader
                    currentImageUrl={form.getValues("logo")}
                    onImageSelectedAction={(file, url) => {
                      field.onChange(file);
                      form.setValue("logo", url || "");
                    }}
                    label="Customer Photo"
                    aspectRatio="square"
                    fallbackName={`${form.watch("first_name")} ${form.watch("last_name")}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <FormField control={form.control} name="short_description" render={({ field }) => (<FormItem><FormLabel>Title / Tagline</FormLabel><FormControl><Input placeholder="e.g., VIP Client" {...field} /></FormControl><FormMessage /></FormItem>)} />
          
          {!hideAgencySelector && (
            <FormField
              control={form.control}
              name="agency_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agency Assignment</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === "headquarters" ? null : value)} defaultValue={field.value || "headquarters"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Assign to an agency..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="headquarters">Headquarters (No Agency)</SelectItem>
                      {agencies.map((agency) => (
                        <SelectItem key={agency.agency_id} value={agency.agency_id!}>{agency.long_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField control={form.control} name="long_description" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Add any relevant notes about this customer..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      )}
    </FormWrapper>
  );
}
EOF
code components/organization/customers/customer-form.tsx

# --- Prospect Form Overhaul ---
# Expands the prospect form to be more comprehensive and useful.
echo "Overhauling Prospect form..."
mkdir -p components/organization/prospects
cat << 'EOF' > components/organization/prospects/prospect-form.tsx
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
import { ImageUploader } from "@/components/ui/image-uploader";

// CORRECTED: Expanded schema
const prospectFormSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  short_description: z.string().max(100).optional().or(z.literal("")),
  long_description: z.string().max(500).optional().or(z.literal("")),
  interest_level: z.string().optional().or(z.literal("")),
  agency_id: z.string().nullable().optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
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
      logo: initialData?.logo || "",
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
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="logoFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prospect Photo/Logo</FormLabel>
                <FormControl>
                  <ImageUploader
                    currentImageUrl={form.getValues("logo")}
                    onImageSelectedAction={(file, url) => { field.onChange(file); form.setValue("logo", url || ""); }}
                    label="Prospect Photo"
                    aspectRatio="square"
                    fallbackName={`${form.watch("first_name")} ${form.watch("last_name")}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
EOF
code components/organization/prospects/prospect-form.tsx

echo "✅ All mismatched partner forms have been overhauled and corrected."