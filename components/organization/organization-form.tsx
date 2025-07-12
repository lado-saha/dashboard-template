"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationDto,
  BusinessDomainDto,
  AddressDto,
  OrganizationLegalForm,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { mediaRepository } from "@/lib/data-repo/media";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { FormWrapper } from "../ui/form-wrapper";
import { Info, FileText, Building, MapPin } from "lucide-react";
import { OrgBasicInfoForm } from "./forms/org-basic-info-form";
import { OrgLegalForm } from "./forms/org-legal-form";
import { OrgBrandingForm } from "./forms/org-branding-form";
import { OrgAddressForm, addressSchema } from "./forms/org-address-form";
import { isValid } from "date-fns";

// --- Zod Schemas for Form Validation ---

const basicInfoSchema = z.object({
  long_name: z.string().min(3, "Official name is required.").max(100),
  short_name: z.string().min(2, "Short name is required.").max(50),
  email: z.string().email("A valid contact email is required."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500),
  business_domains: z
    .array(z.string())
    .min(1, "At least one business domain is required."),
});

const legalFormSchema = z.object({
  legal_form: z.string().min(1, "Legal form is required."),
  business_registration_number: z.string().optional().or(z.literal("")),
  tax_number: z.string().optional().or(z.literal("")),
  capital_share: z.coerce
    .number()
    .positive("Capital share must be positive.")
    .optional()
    .nullable(),
  registration_date: z.date().optional().nullable(),
  year_founded: z.date().optional().nullable(),
  ceo_name: z.string().optional().or(z.literal("")),
});

const brandingSchema = z.object({
  logoFile: z.any().optional(),
  logo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  web_site_url: z
    .string()
    .url("Invalid website URL.")
    .optional()
    .or(z.literal("")),
  social_network: z
    .string()
    .url("Invalid social network URL.")
    .optional()
    .or(z.literal("")),
  keywords: z.string().optional().or(z.literal("")),
  number_of_employees: z.coerce.number().int().min(0).optional().nullable(),
});

const fullOrganizationSchema = basicInfoSchema
  .merge(legalFormSchema)
  .merge(brandingSchema)
  .merge(addressSchema);

type OrganizationFormData = z.infer<typeof fullOrganizationSchema>;

const formSteps = [
  {
    id: "basic",
    name: "Basic Info",
    icon: Info,
    fields: Object.keys(basicInfoSchema.shape),
  },
  {
    id: "legal",
    name: "Legal & Financial",
    icon: FileText,
    fields: Object.keys(legalFormSchema.shape),
  },
  {
    id: "branding",
    name: "Branding & Details",
    icon: Building,
    fields: Object.keys(brandingSchema.shape),
  },
  {
    id: "address",
    name: "Headquarters",
    icon: MapPin,
    fields: Object.keys(addressSchema.shape),
  },
];

interface OrganizationFormProps {
  mode: "create" | "edit";
  initialData?: Partial<OrganizationDto>;
  defaultAddress?: AddressDto | null;
  onSuccessAction: (data: OrganizationDto) => void;
}

export function OrganizationForm({
  mode,
  initialData,
  defaultAddress,
  onSuccessAction,
}: OrganizationFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [availableBusinessDomains, setAvailableBusinessDomains] = useState<
    BusinessDomainDto[]
  >([]);
  const [domainSearch, setDomainSearch] = useState("");

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(fullOrganizationSchema),
    mode: "onChange",
    defaultValues: useMemo(
      () => ({
        long_name: initialData?.long_name || "",
        short_name: initialData?.short_name || "",
        email: initialData?.email || "",
        description: initialData?.description || "",
        business_domains: initialData?.business_domains || [],
        legal_form: initialData?.legal_form || "",
        business_registration_number:
          initialData?.business_registration_number || "",
        tax_number: initialData?.tax_number || "",
        capital_share: initialData?.capital_share || null,
        registration_date:
          initialData?.registration_date &&
          isValid(new Date(initialData.registration_date))
            ? new Date(initialData.registration_date)
            : undefined,
        year_founded:
          initialData?.year_founded &&
          isValid(new Date(initialData.year_founded))
            ? new Date(initialData.year_founded)
            : undefined,
        ceo_name: initialData?.ceo_name || "",
        logo_url: initialData?.logo_url || "",
        web_site_url: initialData?.website_url || "",
        social_network: initialData?.social_network || "",
        keywords: Array.isArray(initialData?.keywords)
          ? initialData.keywords.join(", ")
          : "",
        number_of_employees: (initialData )?.number_of_employees || null,
        address_line_1: defaultAddress?.address_line_1 || "",
        address_line_2: defaultAddress?.address_line_2 || "",
        city: defaultAddress?.city || "",
        state: defaultAddress?.state || "",
        zip_code: defaultAddress?.zip_code || "",
        country: defaultAddress?.country_id || "",
        latitude: defaultAddress?.latitude,
        longitude: defaultAddress?.longitude,
      }),
      [initialData, defaultAddress]
    ),
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

  const onSubmit = async (data: OrganizationFormData) => {
    if (!session?.user.id) {
      toast.error("User session not found. Please re-login.");
      return;
    }
    setIsLoading(true);

    try {
      let logoUrl = data.logo_url || undefined;
      if (data.logoFile instanceof File) {
        const response = await mediaRepository.uploadFile(
          "organization",
          "image",
          "logos",
          session.user.id,
          data.logoFile,
          true
        );
        logoUrl = response.url;
      }

      const orgPayload: CreateOrganizationRequest | UpdateOrganizationRequest =
        {
          long_name: data.long_name,
          short_name: data.short_name,
          email: data.email,
          description: data.description,
          business_domains: data.business_domains,
          legal_form: data.legal_form as OrganizationLegalForm,
          logo_url: logoUrl,
          web_site_url: data.web_site_url,
          social_network: data.social_network,
          keywords: data.keywords
            ? data.keywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
            : [],
          business_registration_number: data.business_registration_number,
          tax_number: data.tax_number,
          capital_share: data.capital_share ?? undefined,
          registration_date: data.registration_date?.toISOString(),
          year_founded: data.year_founded?.toISOString(),
          ceo_name: data.ceo_name,
          number_of_employees: data.number_of_employees ?? undefined,
        };

      const addressPayload = {
        address_line_1: data.address_line_1,
        address_line_2: data.address_line_2,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        country_id: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      if (mode === "create") {
        const orgResponse = await organizationRepository.createOrganization(
          orgPayload as CreateOrganizationRequest
        );
        if (orgResponse?.organization_id) {
          await organizationRepository.createAddress(
            "ORGANIZATION",
            orgResponse.organization_id,
            addressPayload
          );
        }
        onSuccessAction(orgResponse);
      } else if (mode === "edit" && initialData?.organization_id) {
        const updatedOrg = await organizationRepository.updateOrganization(
          initialData.organization_id,
          orgPayload as UpdateOrganizationRequest
        );
        if (defaultAddress?.address_id) {
          await organizationRepository.updateAddress(
            "ORGANIZATION",
            initialData.organization_id,
            defaultAddress.address_id,
            addressPayload
          );
        } else {
          await organizationRepository.createAddress(
            "ORGANIZATION",
            initialData.organization_id,
            addressPayload
          );
        }
        onSuccessAction(updatedOrg);
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${mode} organization.`);
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
          ? "Create New Organization"
          : `Editing: ${initialData?.long_name}`
      }
      description="Complete all steps to save your organization's profile."
      steps={formSteps}
      submitButtonText={
        mode === "create" ? "Create Organization" : "Save All Changes"
      }
    >
      {(currentStep) => (
        <div className="min-h-[450px]">
          {currentStep === 0 && (
            <OrgBasicInfoForm
              form={form}
              filteredDomains={filteredDomains}
              domainSearch={domainSearch}
              onDomainSearchChangeAction={setDomainSearch}
            />
          )}
          {currentStep === 1 && <OrgLegalForm form={form} />}
          {currentStep === 2 && <OrgBrandingForm form={form} />}
          {currentStep === 3 && <OrgAddressForm form={form} />}
        </div>
      )}
    </FormWrapper>
  );
}