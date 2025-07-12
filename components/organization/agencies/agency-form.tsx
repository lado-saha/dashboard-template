"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreateAgencyRequest,
  BusinessDomainDto,
  AgencyDto,
  UpdateAgencyRequest,
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
import {
  Loader2,
  Info,
  FileText,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { AgencyBasicInfoForm } from "./agency-basic-info-form";
import { AgencyLegalForm } from "./agency-legal-form";
import { AgencyBrandingForm } from "./agency-branding-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FormWizard } from "@/components/ui/form-wizard";
import { isValid } from "date-fns";
import { FormWrapper } from "@/components/ui/form-wrapper";

const basicInfoSchema = z.object({
  long_name: z.string().min(3, "Official name is required.").max(100),
  short_name: z.string().min(2, "Short name is required.").max(50),
  location: z.string().min(2, "Location is required."),
  description: z.string().max(500).optional(),
  business_domains: z
    .array(z.string())
    .min(1, "At least one business domain is required."),
  transferable: z.boolean().default(false),
});
const legalSchema = z.object({
  registration_number: z.string().optional(),
  tax_number: z.string().optional(),
  capital_share: z.coerce.number().positive().optional().nullable(),
  average_revenue: z.coerce.number().positive().optional().nullable(),
  registration_date: z.date().optional().nullable(),
});
const brandingSchema = z.object({
  logo: z.string().url("Invalid URL").optional().or(z.literal("")),
  greeting_message: z.string().optional(),
  social_network: z.string().url("Invalid URL").optional().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
  keywords: z.string().optional(),
});
const fullAgencySchema = basicInfoSchema
  .merge(legalSchema)
  .merge(brandingSchema);

type AgencyFormData = z.infer<typeof fullAgencySchema>;

interface AgencyFormProps {
  organizationId: string;
  mode: "create" | "edit";
  initialData?: Partial<AgencyDto>;
  onSuccessAction: (data: AgencyDto) => void;
}

const formSteps = [
  {
    id: "basic",
    name: "Basic Info",
    icon: Info,
    fields: Object.keys(basicInfoSchema.shape) as (keyof AgencyFormData)[],
  },
  {
    id: "legal",
    name: "Legal",
    icon: FileText,
    fields: Object.keys(legalSchema.shape) as (keyof AgencyFormData)[],
  },
  {
    id: "branding",
    name: "Branding",
    icon: Building,
    fields: Object.keys(brandingSchema.shape) as (keyof AgencyFormData)[],
  },
];

export function AgencyForm({
  organizationId,
  mode,
  initialData,
  onSuccessAction,
}: AgencyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [availableBusinessDomains, setAvailableBusinessDomains] = useState<
    BusinessDomainDto[]
  >([]);
  const [domainSearch, setDomainSearch] = useState("");

  const form = useForm<AgencyFormData>({
    resolver: zodResolver(fullAgencySchema),
    mode: "onChange",
    defaultValues: {
      long_name: initialData?.long_name || "",
      short_name: initialData?.short_name || "",
      location: initialData?.location || "",
      description: initialData?.description || "",
      business_domains: initialData?.business_domains || [],
      transferable: initialData?.transferable || false,
      registration_number: initialData?.registration_number || "",
      tax_number: initialData?.tax_number || "",
      capital_share: initialData?.capital_share || null,
      average_revenue: initialData?.average_revenue || null,
      registration_date:
        initialData?.registration_date &&
        isValid(new Date(initialData.registration_date))
          ? new Date(initialData.registration_date)
          : undefined,
      logo: initialData?.logo || "",
      greeting_message: initialData?.greeting_message || "",
      social_network: initialData?.social_network || "",
      images: initialData?.images || [],
    },
  });

  useEffect(() => {
    organizationRepository
      .getAllBusinessDomains()
      .then(setAvailableBusinessDomains);
  }, []);

  const filteredDomains = useMemo(() => {
    if (!domainSearch) return availableBusinessDomains;
    return availableBusinessDomains.filter((d) =>
      d.name?.toLowerCase().includes(domainSearch.toLowerCase())
    );
  }, [domainSearch, availableBusinessDomains]);

  const handleNextStep = async () => {
    const fieldsToValidate = formSteps[currentStep].fields;
    const isStepValid = await form.trigger(fieldsToValidate);
    if (isStepValid) {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep((p) => p + 1);
      }
    } else {
      toast.error("Please correct the errors before proceeding.");
    }
  };

  const onInvalid = (errors: FieldErrors<AgencyFormData>) => {
    toast.error("Please fix the errors before submitting.");
    for (const [index, step] of formSteps.entries()) {
      if (step.fields.some((field) => Object.keys(errors).includes(field))) {
        setCurrentStep(index);
        return;
      }
    }
  };

  const onSubmit = async (data: AgencyFormData) => {
    setIsLoading(true);
    const payload: CreateAgencyRequest | UpdateAgencyRequest = {
      ...data,

      capital_share: data.capital_share ?? undefined,
      registration_date: data.registration_date?.toISOString(),
      average_revenue: data.average_revenue ?? undefined,
    };
    try {
      if (mode === "edit" && initialData?.agency_id) {
        const updatedAgency = await organizationRepository.updateAgency(
          organizationId,
          initialData.agency_id,
          payload
        );
        onSuccessAction(updatedAgency);
      } else {
        const newAgency = await organizationRepository.createAgency(
          organizationId,
          payload as CreateAgencyRequest
        );
        onSuccessAction(newAgency);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${mode} agency.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormWrapper
      form={form}
      onFormSubmit={onSubmit}
      isLoading={isLoading}
      title={
        mode === "create"
          ? "Create New Agency"
          : `Edit Agency: ${initialData?.short_name}`
      }
      description="Fill in the agency's details across all sections."
      steps={formSteps}
      submitButtonText={mode === "create" ? "Create Agency" : "Save Changes"}
    >
      {(currentStep) => (
        <div className="min-h-[400px]">
          {currentStep === 0 && (
            <AgencyBasicInfoForm>
              <FormField
                control={form.control}
                name="business_domains"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Business Domains *</FormLabel>
                    <div className="border rounded-md p-2">
                      <Input
                        placeholder="Search domains..."
                        className="mb-2 h-9"
                        value={domainSearch}
                        onChange={(e) => setDomainSearch(e.target.value)}
                      />
                      <ScrollArea className="h-40">
                        <div className="space-y-2 p-1">
                          {filteredDomains.map((domain) => (
                            <FormItem
                              key={domain.id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(domain.id!)}
                                  onChange={(e) => {
                                    const values = field.value || [];
                                    field.onChange(
                                      e.target.checked
                                        ? [...values, domain.id!]
                                        : values.filter((v) => v !== domain.id!)
                                    );
                                  }}
                                  className="form-checkbox h-4 w-4 rounded"
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">
                                {domain.name}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AgencyBasicInfoForm>
          )}
          {currentStep === 1 && <AgencyLegalForm form={form} />}
          {currentStep === 2 && <AgencyBrandingForm form={form} />}
        </div>
      )}
    </FormWrapper>
  );
}
