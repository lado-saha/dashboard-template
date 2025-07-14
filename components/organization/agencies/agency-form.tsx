"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreateAgencyRequest,
  AgencyDto,
  UpdateAgencyRequest,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { toast } from "sonner";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { Info, FileText, Building } from "lucide-react";
import { AgencyBasicInfoForm } from "./agency-basic-info-form";
import { AgencyLegalForm } from "./agency-legal-form";
import { AgencyBrandingForm } from "./agency-branding-form";
import { isValid } from "date-fns";

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
    fields: Object.keys(basicInfoSchema.shape),
  },
  {
    id: "legal",
    name: "Legal",
    icon: FileText,
    fields: Object.keys(legalSchema.shape),
  },
  {
    id: "branding",
    name: "Branding",
    icon: Building,
    fields: Object.keys(brandingSchema.shape),
  },
];

export function AgencyForm({
  organizationId,
  mode,
  initialData,
  onSuccessAction,
}: AgencyFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (data: AgencyFormData) => {
    setIsLoading(true);
    const payload: CreateAgencyRequest | UpdateAgencyRequest = {
      ...data,
      short_name: data.short_name!, // assert it's present when updating
      long_name: data.long_name,
      location: data.location,
      description: data.description || undefined,
      business_domains: data.business_domains,
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
          {currentStep === 0 && <AgencyBasicInfoForm />}
          {currentStep === 1 && <AgencyLegalForm form={form} />}
          {currentStep === 2 && <AgencyBrandingForm form={form} />}
        </div>
      )}
    </FormWrapper>
  );
}
