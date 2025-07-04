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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Loader2,
  User,
  ChevronLeft,
  Building2,
  ChevronRight,
} from "lucide-react";

const employeeRoleValues: [EmployeeRole, ...EmployeeRole[]] = [
  "CEO",
  "ENGINEER",
  "MARKETING",
  "FINANCE",
  "HR",
  "SALES",
  "CUSTOMERSERVICE",
  "OWNER",
  "SALESPERSON",
  "CUSTOMER",
  "PROVIDER",
  "MANAGER",
  "SUPERADMIN",
  "ADMIN",
  "SUPPORT",
  "OTHER",
];

const employeeFormSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  employee_role: z.enum(employeeRoleValues, {
    required_error: "Employee role is required.",
  }),
  department: z.string().min(2, "Department is required.").optional(),
  short_description: z.string().max(100, "Title is too long.").optional(),
  long_description: z.string().max(500, "Description is too long.").optional(),
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  agency_id: z.string().nullable().optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  organizationId: string;
  initialData?: Partial<EmployeeDto>;
  mode: "create" | "edit";
}

const creationSteps = [
  { id: "details", name: "Employee Details", icon: User },
  { id: "assignment", name: "Agency Assignment", icon: Building2 },
];

export function EmployeeForm({
  organizationId,
  initialData,
  mode,
}: EmployeeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [agencies, setAgencies] = useState<AgencyDto[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
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

  const onInvalidSubmit = (errors: FieldErrors<EmployeeFormData>) => {
    toast.error("Please fix the errors before submitting.");
    if (
      Object.keys(errors).some((field) =>
        ["first_name", "last_name", "employee_role"].includes(field)
      )
    ) {
      setCurrentStep(0);
    }
  };

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
        router.push(`/business-actor/org/employees`);
      } else {
        await organizationRepository.createOrgEmployee(organizationId, data);
        toast.success("Employee created successfully!");
        router.push(`/business-actor/org/employees`);
      }
      router.refresh();
    } catch (error: any)  {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleNextStep = async () => {
    const fieldsToValidate = ["first_name", "last_name", "employee_role"];
    const isStepValid = await form.trigger(
      fieldsToValidate as (keyof EmployeeFormData)[]
    );
    if (isStepValid) {
      setCurrentStep(1);
    }
  };

  const employeeDetailsForm = (
    <Card>
      <CardHeader>
        <CardTitle>Employee Identity & Role</CardTitle>
        <CardDescription>
          Enter the employee personal and professional details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employeeRoleValues.map((role) => (
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
      </CardContent>
    </Card>
  );

  const agencyAssignmentForm = (
    <Card>
      <CardHeader>
        <CardTitle>Agency Assignment</CardTitle>
        <CardDescription>
          Assign this employee to a specific agency or keep them at the
          headquarters.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                  <SelectItem value="headquarters">Headquarters</SelectItem>
                  {agencies.map((agency) => (
                    <SelectItem
                      key={agency.agency_id}
                      value={agency.agency_id!}
                    >
                      {agency.long_name} ({agency.short_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  if (mode === "edit") {
    return (
      <Form {...form}>
        {/* THE FIX: Remove onSubmit from the form tag */}
        <form className="space-y-6">
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>
            {/* THE FIX: Call handleSubmit explicitly on the save button */}
            <Button
              type="button"
              disabled={isLoading}
              onClick={form.handleSubmit(onSubmit, onInvalidSubmit)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">
                <User className="mr-2 h-4 w-4" /> Employee Details
              </TabsTrigger>
              <TabsTrigger value="assignment">
                <Building2 className="mr-2 h-4 w-4" /> Agency Assignment
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">{employeeDetailsForm}</TabsContent>
            <TabsContent value="assignment">{agencyAssignmentForm}</TabsContent>
          </Tabs>
        </form>
      </Form>
    );
  }

  // --- Create Mode (Wizard) ---
  return (
    <Form {...form}>
      {/* THE FIX: Remove onSubmit from the form tag */}
      <form>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Employee</h2>
          <div className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {creationSteps.length}
          </div>
        </div>
        <div className="mb-6">
          {currentStep === 0 && employeeDetailsForm}
          {currentStep === 1 && agencyAssignmentForm}
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(0)}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {currentStep < creationSteps.length - 1 ? (
            <Button type="button" onClick={handleNextStep}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            // THE FIX: Change to type="button" and call handleSubmit in onClick
            <Button
              type="button"
              disabled={isLoading}
              onClick={form.handleSubmit(onSubmit, onInvalidSubmit)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Finish & Create Employee
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
