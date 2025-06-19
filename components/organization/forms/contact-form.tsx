"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateContactRequest, UpdateContactRequest, ContactDto } from "@/types/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const contactFormSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  title: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  phone_number: z.string().optional().or(z.literal("")),
  secondary_email: z.string().email("Invalid secondary email.").optional().or(z.literal("")),
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

export function ContactForm({ initialData, mode, onSubmitAction, onCancelAction }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "", last_name: initialData?.last_name || "",
      title: initialData?.title || "", email: initialData?.email || "", phone_number: initialData?.phone_number || "",
      secondary_email: initialData?.secondary_email || "", secondary_phone_number: initialData?.secondary_phone_number || "",
      fax_number: initialData?.fax_number || "",
    },
  });

  const handleSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      await onSubmitAction(data);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${mode} contact.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="first_name" render={({ field }) => ( <FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="last_name" render={({ field }) => ( <FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
        </div>
        <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title/Position</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Primary Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="phone_number" render={({ field }) => ( <FormItem><FormLabel>Primary Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="secondary_email" render={({ field }) => ( <FormItem><FormLabel>Secondary Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="secondary_phone_number" render={({ field }) => ( <FormItem><FormLabel>Secondary Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancelAction} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {mode === "create" ? "Add Contact" : "Save Changes"}</Button>
        </div>
      </form>
    </Form>
  );
}