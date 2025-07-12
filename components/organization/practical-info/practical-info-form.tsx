"use client";

import React, { useState, useEffect } from "react"; // Added useEffect
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreatePracticalInformationRequest,
  UpdatePracticalInformationRequest,
  PracticalInformationDto,
} from "@/types/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { FormWrapper } from "@/components/ui/form-wrapper";

const practicalInfoFormSchema = z.object({
  type: z
    .string()
    .min(3, "Type must be at least 3 characters long.")
    .max(100, "Type is too long."),
  value: z
    .string()
    .min(1, "Value cannot be empty.")
    .max(1000, "Value is too long."),
  notes: z
    .string()
    .max(500, "Notes are too long.")
    .optional()
    .or(z.literal("")),
});

type PracticalInfoFormData = z.infer<typeof practicalInfoFormSchema>;

interface PracticalInfoFormProps {
  organizationId: string; // To associate with the correct organization
  initialData?: Partial<PracticalInformationDto>; // For editing
  mode: "create" | "edit";
  // Parent handles actual API call and refreshes data
  onSubmitAttemptAction: (
    data: CreatePracticalInformationRequest | UpdatePracticalInformationRequest,
    infoId?: string
  ) => Promise<boolean>;
  onCancelAction: () => void;
}

export function PracticalInfoForm({
  initialData,
  mode,
  onSubmitAttemptAction,
  onCancelAction,
}: PracticalInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PracticalInfoFormData>({
    resolver: zodResolver(practicalInfoFormSchema),
    defaultValues: {
      type: initialData?.type || "",
      value: initialData?.value || "",
      notes: initialData?.notes || "",
    },
  });

  useEffect(() => {
    // Ensure form resets if initialData changes (e.g. opening modal for different item)
    form.reset({
      type: initialData?.type || "",
      value: initialData?.value || "",
      notes: initialData?.notes || "",
    });
  }, [initialData, form.reset]);

  const processSubmit = async (data: PracticalInfoFormData) => {
    setIsSubmitting(true);
    const payload = data as CreatePracticalInformationRequest; // Types are compatible

    const success = await onSubmitAttemptAction(
      payload,
      initialData?.information_id
    );
    if (success) {
      form.reset(); // Reset form on success
    }
    setIsSubmitting(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={processSubmit}
      isLoading={isSubmitting}
      title={mode === "create" ? "Add New Information" : "Edit Information"}
      description={
        mode === "create"
          ? "Provide a new piece of practical information."
          : `Update details for "${initialData?.type}"`
      }
      submitButtonText={mode === "create" ? "Add Information" : "Save Changes"}
    >
      {() => (
        <div className="space-y-6 p-1">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Information Type <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Opening Hours, WiFi Password, Emergency Contact"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A clear category for this piece of information.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Value / Content <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the detailed information here..."
                    {...field}
                    rows={5}
                  />
                </FormControl>
                <FormDescription>
                  The actual piece of information (e.g., Mon-Fri: 9 AM - 5 PM).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any relevant context or extra details..."
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelAction}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "create" ? "Add Information" : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </FormWrapper>
  );
}
