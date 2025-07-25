"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreateCertificationRequest,
  UpdateCertificationRequest,
  CertificationDto,
} from "@/types/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FormWrapper } from "@/components/ui/form-wrapper";

const certificationFormSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters.")
    .max(150, "Name is too long."),
  type: z
    .string()
    .min(3, "Type must be at least 3 characters.")
    .max(100, "Type is too long."),
  description: z
    .string()
    .max(500, "Description is too long.")
    .optional()
    .or(z.literal("")),
  obtainment_date: z.date().optional().nullable(),
});

export type CertificationFormData = z.infer<typeof certificationFormSchema>;

interface CertificationFormProps {
  initialData?: Partial<CertificationDto>;
  mode: "create" | "edit";
  onSubmitAction: (data: CertificationFormData) => Promise<boolean>;
}

export function CertificationForm({
  initialData,
  mode,
  onSubmitAction,
}: CertificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CertificationFormData>({
    resolver: zodResolver(certificationFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      description: initialData?.description || "",
      obtainment_date:
        initialData?.obtainment_date &&
        isValid(new Date(initialData.obtainment_date))
          ? new Date(initialData.obtainment_date)
          : null,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialData?.name || "",
      type: initialData?.type || "",
      description: initialData?.description || "",
      obtainment_date:
        initialData?.obtainment_date &&
        isValid(new Date(initialData.obtainment_date))
          ? new Date(initialData.obtainment_date)
          : null,
    });
  }, [initialData, form.reset]);

  const handleSubmit = async (data: CertificationFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) setIsLoading(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={mode === "create" ? "Add New Certification" : "Edit Certification"}
      description={
        mode === "create"
          ? "Provide details for the new certification."
          : `Update details for "${initialData?.name}"`
      }
      submitButtonText={
        mode === "create" ? "Add Certification" : "Save Changes"
      }
    >
      {() => (
        <div className="space-y-6 p-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certification Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Certified Scrum Master"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certification Type/Body *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Scrum Alliance, ISO" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="obtainment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Obtainment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any relevant details..."
                    {...field}
                    rows={4}
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
