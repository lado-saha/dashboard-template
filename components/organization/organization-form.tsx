"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreateOrganizationRequest,
  OrganizationDto,
  BusinessDomainDto,
  OrganizationLegalForm,
  CreateAddressRequest,
  AddressDto,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { mediaRepository } from "@/lib/data-repo/media";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { FormWizard } from "@/components/ui/form-wizard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Info,
  FileText,
  Building,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { OrgBasicInfoForm } from "./forms/org-basic-info-form";
import { OrgLegalForm } from "./forms/org-legal-form";
import { OrgBrandingForm } from "./forms/org-branding-form";
import { OrgAddressForm } from "./forms/org-address-form";
import { useSession } from "next-auth/react";
import { isValid } from "date-fns";
import { embedId } from "@/lib/id-parser";

// Schemas for each step
const basicInfoSchema = z.object({
  long_name: z.string().min(3, "Official name is required.").max(100),
  short_name: z.string().min(2, "Short name is required.").max(50),
  email: z.string().email("A valid contact email is required."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500),
  business_domains: z.array(z.string()),
  // .min(1, "At least one business domain is required."),
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
  logo_url: z.string().url("Invalid URL.").optional().or(z.literal("")),
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
  number_of_employees: z.coerce
    .number()
    .int()
    .min(0, "Number of employees cannot be negative.")
    .optional()
    .nullable(),
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

export function OrganizationForm({
  onSuccessAction,
}: {
  onSuccessAction: (data: OrganizationDto) => void;
}) {
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
    defaultValues: { business_domains: [], social_networks: [{ url: "" }] },
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
      setCurrentStep((p) => p + 1);
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

  const onSubmit = async (data: OrganizationFormData) => {
    if (!session?.user?.businessActorId) {
      toast.error("Business Actor profile not found. Please re-login.");
      return;
    }
    setIsLoading(true);
    try {
      let logoUrl: string | undefined = undefined;
      if (data.logoFile instanceof File) {
        toast.loading("Uploading logo...");
        const response = await mediaRepository.uploadFile(
          "organization",
          "image",
          "logos",
          session.user.businessActorId,
          data.logoFile,
          true
        );
        logoUrl = response.url;
        toast.dismiss();
      }

      const descriptionWithId = embedId(
        data.description,
        "ba_id",
        session.user.businessActorId
      );

      const orgPayload: CreateOrganizationRequest = {
        long_name: data.long_name,
        short_name: data.short_name,
        email: data.email,
        description: descriptionWithId,
        business_domains:
          data.business_domains.length === 0
            ? ["Other"]
            : data.business_domains,
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
        business_actor_id: session.user.businessActorId,
      };

      const orgResponse = await organizationRepository.createOrganization(
        orgPayload
      );

      if (orgResponse && orgResponse.organization_id) {
        const addressPayload: CreateAddressRequest = {
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
        try {
          await organizationRepository.createAddress(
            "ORGANIZATION",
            orgResponse.organization_id,
            addressPayload
          );
        } catch (addressError: any) {
          toast.warning(
            `Organization created, but failed to save address: ${addressError.message}`
          );
        }
        toast.success(
          `Organization "${orgResponse.short_name}" created successfully!`
        );
        onSuccessAction(orgResponse);
      } else {
        throw new Error("Failed to get organization ID after creation.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create organization.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <OrgBasicInfoForm
            form={form}
            filteredDomains={filteredDomains}
            domainSearch={domainSearch}
            onDomainSearchChangeAction={setDomainSearch}
          />
        );
      case 1:
        return <OrgLegalForm form={form} />;
      case 2:
        return <OrgBrandingForm form={form} />;
      case 3:
        return <OrgAddressForm form={form} />;
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <FormWizard
          steps={formSteps}
          currentStepIndex={currentStep}
          onStepClick={(index) => {
            if (index < currentStep) setCurrentStep(index);
          }}
        />
        <Card>
          <CardHeader>
            <CardTitle>{formSteps[currentStep].name}</CardTitle>
          </CardHeader>
          {renderCurrentStep()}
        </Card>
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep((p) => p - 1)}
            disabled={currentStep === 0 || isLoading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < formSteps.length - 1 ? (
            <Button type="button" onClick={handleNextStep}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isLoading}
              onClick={form.handleSubmit(onSubmit, onInvalid)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Organization
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
