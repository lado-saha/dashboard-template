"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerDto,
} from "@/types/organization";
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
import { Textarea } from "@/components/ui/textarea";

const customerFormSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  payment_method: z.string().optional(),
  amount_paid: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  initialData?: Partial<CustomerDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: CustomerFormData) => Promise<boolean>;
}

export function CustomerForm({
  initialData,
  mode,
  onSubmitAction,
}: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      payment_method: initialData?.payment_method || "",
      amount_paid: initialData?.amount_paid || "",
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
      title={mode === "create" ? "Add New Customer" : "Edit Customer"}
      description="Manage customer information for your organization."
      submitButtonText={mode === "create" ? "Add Customer" : "Save Changes"}
    >
      {() => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="short_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title / Tagline</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., VIP Client" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="long_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any relevant notes about this customer..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </FormWrapper>
  );
}
