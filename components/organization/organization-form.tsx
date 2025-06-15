"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationDto,
  OrganizationLegalForm,
  BusinessDomainDto,
} from "@/types/organization"; // Assuming types are defined
import { organizationApi } from "@/lib/apiClient"; // Assuming API client is set up
import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Info,
  Building,
  LinkIcon,
  FileText,
  Tag,
  CalendarDays,
  Users,
  Briefcase,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
// MultiSelect component would be a custom component or from a library
// For now, we'll simulate with a placeholder or a simpler approach.

// Zod Schema for the form (combining create and update aspects)
// Note: 'business_domains' requires fetching options and handling array of strings (UUIDs)
const organizationFormSchema = z.object({
  long_name: z
    .string()
    .min(3, "Long name must be at least 3 characters.")
    .max(100),
  short_name: z
    .string()
    .min(2, "Short name must be at least 2 characters.")
    .max(50),
  email: z.string().email("Invalid email address."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500),
  legal_form: z.string().min(1, "Legal form is required."), // Assuming OrganizationLegalForm is a string enum
  business_domains: z
    .array(z.string().uuid("Invalid domain ID"))
    .min(1, "At least one business domain is required."),
  logo_url: z
    .string()
    .url("Invalid URL for logo.")
    .optional()
    .or(z.literal("")),
  web_site_url: z
    .string()
    .url("Invalid website URL.")
    .optional()
    .or(z.literal("")),
  social_network: z.string().optional().or(z.literal("")), // Could be a URL or just text
  business_registration_number: z.string().optional().or(z.literal("")),
  tax_number: z.string().optional().or(z.literal("")),
  capital_share: z.coerce
    .number()
    .positive("Capital share must be positive.")
    .optional()
    .nullable(),
  registration_date: z.date().optional().nullable(),
  ceo_name: z.string().optional().or(z.literal("")),
  year_founded: z.date().optional().nullable(), // Changed to date for easier picking
  keywords: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : []
    ), // Input as comma-separated string
  number_of_employees: z.coerce
    .number()
    .int()
    .min(0, "Number of employees cannot be negative.")
    .optional()
    .nullable(),
});

type OrganizationFormData = z.infer<typeof organizationFormSchema>;

interface OrganizationFormProps {
  initialData?: Partial<OrganizationDto>; // For pre-filling the form in edit mode
  mode: "create" | "edit";
  onFormSubmitSuccess: (data: OrganizationDto) => void; // Callback on successful submission
  organizationId?: string; // Required for edit mode
}

// Example Legal Forms (these should ideally come from a config or API)
const legalFormOptions: { value: OrganizationLegalForm; label: string }[] = [
  { value: "11", label: "Sole Proprietorship" },
  { value: "21", label: "General Partnership" },
  { value: "22", label: "Limited Partnership" },
  { value: "31", label: "Private Limited Company (Ltd)" },
  { value: "32", label: "Public Limited Company (PLC)" },
  { value: "51", label: "Cooperative" },
  // ... Add all relevant legal forms based on your spec's enum
  { value: "85", label: "Other Legal Form" },
];

export function OrganizationForm({
  initialData,
  mode,
  onFormSubmitSuccess,
  organizationId,
}: OrganizationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableBusinessDomains, setAvailableBusinessDomains] = useState<
    BusinessDomainDto[]
  >([]);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      long_name: initialData?.long_name || "",
      short_name: initialData?.short_name || "",
      email: initialData?.email || "",
      description: initialData?.description || "",
      legal_form: initialData?.legal_form || "",
      business_domains: initialData?.business_domains || [],
      logo_url: initialData?.logo_url || "",
      web_site_url: initialData?.website_url || "", // Note spec diff: website_url vs web_site_url
      social_network: initialData?.social_network || "",
      business_registration_number:
        initialData?.business_registration_number || "",
      tax_number: initialData?.tax_number || "",
      capital_share: initialData?.capital_share || null,
      registration_date:
        initialData?.registration_date &&
        isValid(parseISO(initialData.registration_date))
          ? parseISO(initialData.registration_date)
          : null,
      ceo_name: initialData?.ceo_name || "",
      year_founded:
        initialData?.year_founded && isValid(parseISO(initialData.year_founded))
          ? parseISO(initialData.year_founded)
          : null,
      keywords: initialData?.keywords || [],
      number_of_employees: (initialData as any)?.number_of_employees || null, // Assuming this field exists in your DTO or will be added
    },
  });

  useEffect(() => {
    // Fetch available business domains (mocked for now)
    const fetchDomains = async () => {
      try {
        // const domains = await organizationApi.getAllBusinessDomains({}); // REAL API CALL
        await new Promise((r) => setTimeout(r, 300));
        const mockDomains: BusinessDomainDto[] = [
          {
            id: "domain-uuid-1",
            name: "Technology & Software",
            type_label: "IT",
          },
          {
            id: "domain-uuid-2",
            name: "Healthcare Services",
            type_label: "Health",
          },
          {
            id: "domain-uuid-3",
            name: "Retail & E-commerce",
            type_label: "Commerce",
          },
          {
            id: "domain-uuid-4",
            name: "Financial Services",
            type_label: "Finance",
          },
          {
            id: "domain-uuid-5",
            name: "Consulting Services",
            type_label: "Services",
          },
        ];
        setAvailableBusinessDomains(mockDomains);
      } catch (error) {
        toast.error("Failed to load business domains.");
      }
    };
    fetchDomains();
  }, []);

  useEffect(() => {
    // Reset form when initialData changes (e.g., switching to edit another item)
    form.reset({
      long_name: initialData?.long_name || "",
      short_name: initialData?.short_name || "",
      email: initialData?.email || "",
      description: initialData?.description || "",
      legal_form: initialData?.legal_form || "",
      business_domains: initialData?.business_domains || [],
      logo_url: initialData?.logo_url || "",
      web_site_url: initialData?.website_url || "",
      social_network: initialData?.social_network || "",
      business_registration_number:
        initialData?.business_registration_number || "",
      tax_number: initialData?.tax_number || "",
      capital_share: initialData?.capital_share || null,
      registration_date:
        initialData?.registration_date &&
        isValid(parseISO(initialData.registration_date))
          ? parseISO(initialData.registration_date)
          : null,
      ceo_name: initialData?.ceo_name || "",
      year_founded:
        initialData?.year_founded && isValid(parseISO(initialData.year_founded))
          ? parseISO(initialData.year_founded)
          : null,
      keywords: initialData?.keywords || [],
      number_of_employees: (initialData as any)?.number_of_employees || null,
    });
  }, [initialData, form.reset]);

  const onSubmit: SubmitHandler<OrganizationFormData> = async (data) => {
    setIsLoading(true);
    const requestData: CreateOrganizationRequest | UpdateOrganizationRequest = {
      ...data,
      capital_share: data.capital_share ?? undefined, // Send undefined if null
      number_of_employees: data.number_of_employees ?? undefined, // Send undefined if null
      registration_date: data.registration_date
        ? data.registration_date.toISOString()
        : undefined,
      year_founded: data.year_founded
        ? data.year_founded.toISOString()
        : undefined,
      keywords: data.keywords, // Already an array of strings
      legal_form: data.legal_form as OrganizationLegalForm, // Cast assuming validation
    };

    try {
      let response: OrganizationDto;
      if (mode === "create") {
        response = await organizationApi.createOrganization(
          requestData as CreateOrganizationRequest
        );
        toast.success("Organization created successfully!");
      } else if (organizationId) {
        response = await organizationApi.updateOrganization(
          organizationId,
          requestData as UpdateOrganizationRequest
        );
        toast.success("Organization updated successfully!");
      } else {
        throw new Error("Organization ID is missing for update.");
      }
      onFormSubmitSuccess(response);
    } catch (error: any) {
      console.error(`Failed to ${mode} organization:`, error);
      toast.error(error.message || `Failed to ${mode} organization.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Building className="mr-3 h-6 w-6 text-primary" />
          {mode === "create"
            ? "Create New Organization"
            : "Edit Organization Details"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Fill in the details to set up your new organization."
            : "Update the information for your organization."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 py-6">
            {/* Basic Information Section */}
            <section className="space-y-4 p-4 border rounded-lg bg-background/30">
              <h3 className="text-lg font-semibold flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="long_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Official Name{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company LLC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="short_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Short Name / Acronym{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="YourCo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Contact Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@yourcompany.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description / About Us{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your organization..."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Link to your company logo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Legal & Structure Section */}
            <section className="space-y-4 p-4 border rounded-lg bg-background/30">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Legal & Structure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="legal_form"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Legal Form <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select legal form" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {legalFormOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
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
                  name="business_registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Registration No.</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / VAT Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., IE1234567X" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capital_share"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capital Share (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 10000"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Operational Details Section */}
            <section className="space-y-4 p-4 border rounded-lg bg-background/30">
              <h3 className="text-lg font-semibold flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Operational Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ceo_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEO / Main Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="number_of_employees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 50"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registration_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Registration Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal h-10",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
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
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year_founded"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Year Founded</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal h-10",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "yyyy")
                              ) : (
                                <span>Pick founding year</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Online Presence & Branding Section */}
            <section className="space-y-4 p-4 border rounded-lg bg-background/30">
              <h3 className="text-lg font-semibold flex items-center">
                <LinkIcon className="mr-2 h-5 w-5" />
                Online Presence & Branding
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="web_site_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://yourcompany.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social_network"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Media Link (e.g., LinkedIn)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://linkedin.com/company/yourco"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords / Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., tech, saas, innovation (comma-separated)"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                        value={
                          Array.isArray(field.value)
                            ? field.value.join(", ")
                            : field.value
                        }
                      />
                    </FormControl>
                    <FormDescription>Comma-separated values.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name="business_domains"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Business Domains{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    {/* Basic multi-select placeholder - replace with a proper component */}
                    <div className="space-y-2">
                      {availableBusinessDomains.map((domain) => (
                        <FormItem
                          key={domain.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                              checked={field.value?.includes(domain.id!)}
                              onChange={(e) => {
                                const currentValues = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([
                                    ...currentValues,
                                    domain.id!,
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValues.filter(
                                      (value) => value !== domain.id!
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {domain.name} ({domain.type_label})
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto ml-auto"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Organization" : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
