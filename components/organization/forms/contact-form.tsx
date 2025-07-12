"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ContactDto } from "@/types/organization";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { FormWrapper } from "@/components/ui/form-wrapper"; // [ADD] Import the wrapper

const contactFormSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  title: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("Invalid email address.")
    .optional()
    .or(z.literal("")),
  phone_number: z.string().optional().or(z.literal("")),
  secondary_email: z
    .string()
    .email("Invalid secondary email.")
    .optional()
    .or(z.literal("")),
  secondary_phone_number: z.string().optional().or(z.literal("")),
  fax_number: z.string().optional().or(z.literal("")),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  initialData?: Partial<ContactDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: ContactFormData) => Promise<void>;
  onCancelAction: () => void;
}

export function ContactForm({
  initialData,
  mode,
  onSubmitAction,
  onCancelAction,
}: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      /* ... same default values ... */
    },
  });

  const handleSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      await onSubmitAction(data);
    } catch (error) {
      toast.error(error.message || `Failed to ${mode} contact.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // [CHANGE] Wrap the entire form content with FormWrapper
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === "create" ? "Add New Contact" : "Edit Contact"}
      description="Fill in the contact's details below."
      submitButtonText={mode === "create" ? "Add Contact" : "Save Changes"}
    >
      {() => (
        // The children function simply returns the form fields
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title/Position</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="secondary_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondary_phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </FormWrapper>
  );
}
