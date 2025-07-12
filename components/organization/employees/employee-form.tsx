"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AgencyDto,
  EmployeeDto,
  EmployeeRoleValues,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/ui/image-uploader";
import { User, Building2 } from "lucide-react";

const employeeDetailsSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  employee_role: z.enum(EmployeeRoleValues, {
    required_error: "Employee role is required.",
  }),
  department: z
    .string()
    .min(2, "Department is required.")
    .optional()
    .or(z.literal("")),
  short_description: z.string().max(100, "Title is too long.").optional(),
  long_description: z.string().max(500, "Description is too long.").optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoFile: z.any().optional(),
});

const assignmentSchema = z.object({
  agency_id: z.string().nullable().optional(),
});

const fullEmployeeSchema = employeeDetailsSchema.merge(assignmentSchema);
export type EmployeeFormData = z.infer<typeof fullEmployeeSchema>;

const formSteps = [
  {
    id: "details",
    name: "Employee Details",
    icon: User,
    fields: Object.keys(employeeDetailsSchema.shape),
  },
  {
    id: "assignment",
    name: "Agency Assignment",
    icon: Building2,
    fields: Object.keys(assignmentSchema.shape),
  },
];

interface EmployeeFormProps {
  agencies: AgencyDto[];
  mode: "create" | "edit";
  onSubmitAction: (data: EmployeeFormData) => Promise<boolean>;
  initialData?: Partial<EmployeeDto>;
  // [ADD] Prop to lock the form to a specific agency
  scopedAgencyId?: string | null;
}

export function EmployeeForm({
  initialData,
  agencies,
  mode,
  onSubmitAction,
  scopedAgencyId,
}: EmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(fullEmployeeSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      employee_role: initialData?.employee_role || undefined,
      department: initialData?.department || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      logo: initialData?.logo || "",
      // [CHANGE] If scoped to an agency, use that ID, otherwise use initial data.
      agency_id:
        scopedAgencyId !== undefined
          ? scopedAgencyId
          : initialData?.agency_id || null,
    },
  });

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    const success = await onSubmitAction(data);
    if (!success) setIsLoading(false);
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={handleSubmit}
      isLoading={isLoading}
      title={
        mode === "create"
          ? "Add New Employee"
          : `Edit Employee: ${initialData?.first_name} ${initialData?.last_name}`
      }
      description="Provide the employee's details and assign them to an agency."
      steps={formSteps}
      submitButtonText={mode === "create" ? "Create Employee" : "Save Changes"}
    >
      {(currentStep) => (
        <div className="min-h-[450px] p-1">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="logoFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Photo</FormLabel>
                    <FormControl>
                      <ImageUploader
                        currentImageUrl={form.getValues("logo")}
                        onImageSelectedAction={(file, url) => {
                          field.onChange(file);
                          form.setValue("logo", url || "");
                        }}
                        label=""
                        fallbackName={`${form.getValues(
                          "first_name"
                        )} ${form.getValues("last_name")}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employee_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EmployeeRoleValues.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.replace(/_/g, " ").charAt(0).toUpperCase() +
                              role.replace(/_/g, " ").slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Senior Software Engineer"
                        {...field}
                      />
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
                    <FormLabel>Responsibilities</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="agency_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Assignment</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "headquarters" ? null : value)
                      }
                      defaultValue={field.value || "headquarters"}
                      // [CHANGE] Disable the select if we are scoped to a specific agency
                      disabled={scopedAgencyId !== undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="headquarters">
                          Headquarters
                        </SelectItem>
                        {agencies.map((agency) => (
                          <SelectItem
                            key={agency.agency_id}
                            value={agency.agency_id!}
                          >
                            {agency.long_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      )}
    </FormWrapper>
  );
}
