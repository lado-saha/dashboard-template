"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AgencyDto,
  EmployeeDto,
  EmployeeRole,
  EmployeeRoleValues,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Loader2,
  User,
  ChevronLeft,
  Building2,
  ChevronRight,
} from "lucide-react";
import { FormWizard } from "@/components/ui/form-wizard";
import { FormWrapper } from "@/components/ui/form-wrapper";

const employeeDetailsSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  employee_role: z.enum(EmployeeRoleValues, {
    required_error: "Employee role is required.",
  }),
  department: z.string().min(2, "Department is required.").optional(),
  short_description: z.string().max(100, "Title is too long.").optional(),
  long_description: z.string().max(500, "Description is too long.").optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const assignmentSchema = z.object({
  agency_id: z.string().nullable().optional(),
});

const fullEmployeeSchema = employeeDetailsSchema.merge(assignmentSchema);
type EmployeeFormData = z.infer<typeof fullEmployeeSchema>;

const formSteps = [
  {
    id: "details",
    name: "Employee Details",
    icon: User,
    fields: Object.keys(
      employeeDetailsSchema.shape
    ) as (keyof EmployeeFormData)[],
  },
  {
    id: "assignment",
    name: "Agency Assignment",
    icon: Building2,
    fields: Object.keys(assignmentSchema.shape) as (keyof EmployeeFormData)[],
  },
];

interface EmployeeFormProps {
  organizationId: string;
  initialData?: Partial<EmployeeDto>;
  mode: "create" | "edit";
  onSuccessAction: () => void;
}

export function EmployeeForm({
  organizationId,
  initialData,
  mode,
  onSuccessAction,
}: EmployeeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(fullEmployeeSchema),
    mode: "onChange",
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      employee_role: initialData?.employee_role || undefined,
      department: initialData?.department || "",
      short_description: initialData?.short_description || "",
      long_description: initialData?.long_description || "",
      logo: initialData?.logo || "",
      agency_id: initialData?.agency_id || null,
    },
  });

  useEffect(() => {
    organizationRepository
      .getAgencies(organizationId, true)
      .then(setAgencies)
      .catch(() => toast.error("Could not load agency list."));
  }, [organizationId]);

  async function onSubmit(data: EmployeeFormData) {
    setIsLoading(true);
    try {
      if (mode === "edit" && initialData?.employee_id) {
        await organizationRepository.updateOrgEmployee(
          organizationId,
          initialData.employee_id,
          data
        );
        toast.success("Employee updated successfully!");
      } else {
        await organizationRepository.createOrgEmployee(organizationId, data);
        toast.success("Employee created successfully!");
      }
      onSuccessAction();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormWrapper
      form={form}
      onFormSubmit={onSubmit}
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
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Photo</FormLabel>
                    <FormControl>
                      <ImageUploader
                        currentImageUrl={field.value}
                        onImageSelectedAction={(file, url) =>
                          field.onChange(url || "")
                        }
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
                    <FormLabel>Agency</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "headquarters" ? null : value)
                      }
                      defaultValue={field.value || "headquarters"}
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
