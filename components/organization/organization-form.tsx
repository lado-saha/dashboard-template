"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreateOrganizationRequest,
  OrganizationDto,
  BusinessDomainDto,
  OrganizationLegalForm,
  AddressDto,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { mediaRepository } from "@/lib/data-repo/media";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { Info, FileText, Building, MapPin } from "lucide-react";
import { OrgBasicInfoForm } from "./forms/org-basic-info-form";
import { OrgLegalForm } from "./forms/org-legal-form";
import { OrgBrandingForm } from "./forms/org-branding-form";
import { OrgAddressForm } from "./forms/org-address-form";
import { isValid } from "date-fns";
import { embedId } from "@/lib/id-parser";
import { FormWrapper } from "@/components/ui/form-wrapper";

// Schemas remain the same
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
});
const brandingSchema = z.object({
  logoFile: z.any().optional(),
  logo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  web_site_url: z
    .string()
    .url("Invalid website URL.")
    .optional()
    .or(z.literal("")),
  social_networks: z
    .array(
      z.object({
        url: z
          .string()
          .url({ message: "Please enter a valid URL." })
          .or(z.literal("")),
      })
    )
    .optional(),
  keywords: z.string().optional().or(z.literal("")),
  number_of_employees: z.coerce.number().int().min(0).optional().nullable(),
});
const addressSchema = z.object({
  address_line_1: z.string().min(3, "Address line 1 is required."),
  address_line_2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State/Province is required."),
  zip_code: z.string().min(3, "Zip/Postal code is required."),
  country: z.string().min(2, "Country is required."),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});
const fullOrganizationSchema = basicInfoSchema
  .merge(legalFormSchema)
  .merge(brandingSchema)
  .merge(addressSchema);
type OrganizationFormData = z.infer<typeof fullOrganizationSchema>;

// --- CHANGE 1: Define a proper props interface ---
interface OrganizationFormProps {
  mode: "create" | "edit";
  initialData?: Partial<OrganizationDto>; // Optional: for edit mode
  defaultAddress?: AddressDto | null; // Optional: for edit mode
  onSuccessAction: (data: OrganizationDto) => void;
}

const formSteps = [
  {
    id: "basic",
    name: "Basic Info",
    icon: Info,
    fields: Object.keys(
      basicInfoSchema.shape
    ) as (keyof OrganizationFormData)[],
  },
  {
    id: "legal",
    name: "Legal & Financial",
    icon: FileText,
    fields: Object.keys(
      legalFormSchema.shape
    ) as (keyof OrganizationFormData)[],
  },
  {
    id: "branding",
    name: "Branding & Details",
    icon: Building,
    fields: Object.keys(brandingSchema.shape) as (keyof OrganizationFormData)[],
  },
  {
    id: "address",
    name: "Headquarters",
    icon: MapPin,
    fields: Object.keys(addressSchema.shape) as (keyof OrganizationFormData)[],
  },
];

// --- CHANGE 2: Use the new props interface ---
export function OrganizationForm({
  mode,
  initialData,
  defaultAddress,
  onSuccessAction,
}: OrganizationFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [availableBusinessDomains, setAvailableBusinessDomains] = useState<
    BusinessDomainDto[]
  >([]);
  const [domainSearch, setDomainSearch] = useState("");

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(fullOrganizationSchema),
    mode: "onChange",
    // --- CHANGE 3: Set defaultValues dynamically based on mode ---
    defaultValues: useMemo(() => {
      const socialNetworks =
        initialData?.social_network
          ?.split(",")
          .filter(Boolean)
          .map((url) => ({ url })) || [];

      return {
        long_name: initialData?.long_name || "",
        short_name: initialData?.short_name || "",
        email: initialData?.email || "",
        description: initialData?.description || "",
        business_domains: initialData?.business_domains?.length
          ? initialData.business_domains
          : [],
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
        logo_url: initialData?.logo_url || "",
        web_site_url: initialData?.website_url || "",
        social_networks:
          socialNetworks.length > 0 ? socialNetworks : [{ url: "" }],
        keywords: Array.isArray(initialData?.keywords)
          ? initialData.keywords.join(", ")
          : "",
        number_of_employees: (initialData as any)?.number_of_employees || null,
        address_line_1: defaultAddress?.address_line_1 || "",
        address_line_2: defaultAddress?.address_line_2 || "",
        city: defaultAddress?.city || "",
        state: defaultAddress?.state || "",
        zip_code: defaultAddress?.zip_code || "",
        country: defaultAddress?.country_id || "",
        latitude: defaultAddress?.latitude,
        longitude: defaultAddress?.longitude,
      };
    }, [initialData, defaultAddress]),
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

  const onInvalid = (errors: FieldErrors<OrganizationFormData>) => {
    toast.error("Please fix the errors before submitting.");
    for (const [index, step] of formSteps.entries()) {
      if (step.fields.some((field) => Object.keys(errors).includes(field))) {
        setCurrentStep(index);
        return;
      }
    }
  };

  // --- CHANGE 4: The onSubmit function now handles both create and edit modes ---
  const onSubmit = async (data: OrganizationFormData) => {
    const baId = session?.user?.businessActorId;
    if (!baId) {
      toast.error("Business Actor profile not found. Please re-login.");
      return;
    }
    setIsLoading(true);

    try {
      // Logo upload logic is the same for both modes
      let logoUrl = data.logo_url || undefined;
      if (data.logoFile instanceof File) {
        const response = await mediaRepository.uploadFile(
          "organization",
          "image",
          "logos",
          baId,
          data.logoFile,
          true
        );
        logoUrl = response.url;
      }

      // Shared payload for both create and update
      const orgPayload = {
        long_name: data.long_name,
        short_name: data.short_name,
        email: data.email,
        description: data.description, // No need for embedId in update
        business_domains: data.business_domains,
        legal_form: data.legal_form as OrganizationLegalForm,
        logo_url: logoUrl,
        web_site_url: data.web_site_url,
        social_network:
          data.social_networks
            ?.map((item) => item.url)
            .filter(Boolean)
            .join(",") || "",
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
        default: true,
      };

      if (mode === "create") {
        const createPayload: CreateOrganizationRequest = {
          ...orgPayload,
          description: embedId(data.description, "ba_id", baId), // Embed ID only on create
          business_actor_id: baId,
        };
        const orgResponse = await organizationRepository.createOrganization(
          createPayload
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
          orgPayload
        );

        if (defaultAddress?.address_id) {
          // If an address exists, update it
          await organizationRepository.updateAddress(
            "ORGANIZATION",
            initialData.organization_id,
            defaultAddress.address_id,
            addressPayload
          );
        } else {
          // If no address exists, create one
          await organizationRepository.createAddress(
            "ORGANIZATION",
            initialData.organization_id,
            addressPayload
          );
        }

        onSuccessAction(updatedOrg);
      }
    } catch (error: any) {
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
        mode === "create" ? "Create Organization" : "Save Changes"
      }
    >
      {(currentStep) => (
        // This function returns the content for the current step
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
