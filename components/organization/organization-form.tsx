"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  SubmitHandler,
  FieldErrors,
  FieldName,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationDto,
  BusinessDomainDto,
  OrganizationLegalForm,
  CreateAddressRequest,
  AddressDto,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { toast } from "sonner";

import { CardFooter } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Info, FileText, Building, MapPin } from "lucide-react";

import { OrgBasicInfoForm, basicInfoSchema } from "./forms/org-basic-info-form";
import { OrgLegalForm, legalFormSchema } from "./forms/org-legal-form";
import { OrgBrandingForm, brandingSchema } from "./forms/org-branding-form";
import { OrgAddressForm, addressSchema } from "./forms/org-address-form";
import { isValid, parseISO } from "date-fns";

const fullOrganizationSchema = basicInfoSchema
  .merge(legalFormSchema)
  .merge(brandingSchema)
  .merge(addressSchema)
  .extend({
    business_domains: z
      .array(z.string())
      .min(1, "At least one business domain is required."),
  });

type OrganizationFormData = z.infer<typeof fullOrganizationSchema>;

interface OrganizationFormProps {
  initialData?: Partial<OrganizationDto>;
  mode: "create" | "edit";
  onFormSubmitSuccessAction: (data: OrganizationDto) => void;
  organizationId?: string;
  defaultAddress?: AddressDto | null;
}

const formSteps = [
  {
    id: "step1",
    name: "Basic Info",
    icon: Info,
    fields: Object.keys(
      basicInfoSchema.shape
    ) as FieldName<OrganizationFormData>[],
  },
  {
    id: "step2",
    name: "Legal & Financial",
    icon: FileText,
    fields: Object.keys(
      legalFormSchema.shape
    ) as FieldName<OrganizationFormData>[],
  },
  {
    id: "step3",
    name: "Branding & Details",
    icon: Building,
    fields: Object.keys(
      brandingSchema.shape
    ) as FieldName<OrganizationFormData>[],
  },
  {
    id: "step4",
    name: "Headquarters",
    icon: MapPin,
    fields: Object.keys(
      addressSchema.shape
    ) as FieldName<OrganizationFormData>[],
  },
];

export function OrganizationForm({
  initialData,
  mode,
  onFormSubmitSuccessAction,
  organizationId,
  defaultAddress, // THE FIX: Destructure new prop
}: OrganizationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [availableBusinessDomains, setAvailableBusinessDomains] = useState<
    BusinessDomainDto[]
  >([]);
  const [domainSearch, setDomainSearch] = useState("");

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(fullOrganizationSchema),
    mode: "onChange",
    defaultValues: {
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
        initialData?.year_founded && isValid(new Date(initialData.year_founded))
          ? new Date(
              new Date(initialData.year_founded).getFullYear().toString()
            )
          : undefined,
      logo_url: initialData?.logo_url || "",
      web_site_url: initialData?.website_url || "",
      social_networks: initialData?.social_network
        ? initialData.social_network
            .split(",")
            .filter(Boolean)
            .map((url) => ({ url }))
        : [{ url: "" }],
      keywords: Array.isArray(initialData?.keywords)
        ? initialData.keywords.join(", ")
        : initialData?.keywords || "",
      ceo_name: initialData?.ceo_name || "",
      number_of_employees: (initialData as any)?.number_of_employees || null,
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  useEffect(() => {
    organizationRepository
      .getAllBusinessDomains()
      .then(setAvailableBusinessDomains);
  }, []);

  useEffect(() => {
    if (initialData) {
      const combinedData = {
        ...initialData,
        keywords: Array.isArray(initialData.keywords)
          ? initialData.keywords.join(", ")
          : initialData.keywords || "",
        social_networks: initialData.social_network
          ? initialData.social_network
              .split(",")
              .filter(Boolean)
              .map((url) => ({ url }))
          : [{ url: "" }],
        registration_date:
          initialData.registration_date &&
          isValid(new Date(initialData.registration_date))
            ? new Date(initialData.registration_date)
            : undefined,
        year_founded:
          initialData.year_founded &&
          isValid(new Date(initialData.year_founded))
            ? new Date(initialData.year_founded)
            : undefined,
        // Now, merge the default address if it exists
        address_line_1: defaultAddress?.address_line_1 || "",
        address_line_2: defaultAddress?.address_line_2 || "",
        city: defaultAddress?.city || "",
        state: defaultAddress?.state || "",
        zip_code: defaultAddress?.zip_code || "",
        country: defaultAddress?.country_id || "", // Map country_id to country field
        latitude: defaultAddress?.latitude,
        longitude: defaultAddress?.longitude,
      };
      form.reset(combinedData);
    }
  }, [initialData, defaultAddress, form]);

  const handleHashChange = useCallback(() => {
    if (mode === "edit") {
      const hash = window.location.hash.replace("#", "");
      const stepIndex = formSteps.findIndex((step) => step.id === hash);
      if (stepIndex !== -1 && stepIndex !== currentStep)
        setCurrentStep(stepIndex);
    }
  }, [mode, currentStep]);

  useEffect(() => {
    /* ... same effect for hash change ... */
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [handleHashChange]);

  const filteredDomains = useMemo(() => {
    /* ... same memoized filtering ... */
    if (!domainSearch) return availableBusinessDomains;
    return availableBusinessDomains.filter((domain) =>
      domain.name?.toLowerCase().includes(domainSearch.toLowerCase())
    );
  }, [domainSearch, availableBusinessDomains]);

  const handleNextStep = async () => {
    /* ... same next step logic ... */
    const fieldsToValidate = formSteps[currentStep].fields;
    const isStepValid = await form.trigger(
      fieldsToValidate as (keyof OrganizationFormData)[]
    );

    let isDomainValid = true;
    if (currentStep === 0) {
      if (form.getValues("business_domains").length === 0) {
        form.setError("business_domains", {
          type: "manual",
          message: "At least one business domain is required.",
        });
        isDomainValid = false;
      } else {
        form.clearErrors("business_domains");
      }
    }
    if (isStepValid && isDomainValid) {
      if (currentStep < formSteps.length - 1) {
        const nextStepId = formSteps[currentStep + 1].id;
        setCurrentStep((p) => p + 1);
        if (mode === "edit")
          router.replace(`#${nextStepId}`, { scroll: false });
      }
    } else {
      toast.error("Please fix the errors on this page before proceeding.");
    }
  };

  const handleTabChange = (value: string) => {
    const targetStepIndex = formSteps.findIndex((s) => s.id === value);
    if (targetStepIndex === -1) return;
    if (mode === "create" && targetStepIndex > currentStep) {
      toast.info("Please use the 'Next' button to proceed sequentially.");
      return;
    }
    setCurrentStep(targetStepIndex);
    if (mode === "edit") router.replace(`#${value}`, { scroll: false });
  };

  const onInvalidSubmit = (errors: FieldErrors<OrganizationFormData>) => {
    toast.error("Please fix the errors before submitting.");
    for (const [index, step] of formSteps.entries()) {
      const hasErrorInStep = step.fields.some(
        (field) => errors[field as keyof OrganizationFormData]
      );
      if (hasErrorInStep || (index === 0 && errors.business_domains)) {
        setCurrentStep(index);
        if (mode === "edit") router.replace(`#${step.id}`, { scroll: false });
        return;
      }
    }
  };

  // THE FIX: Corrected submission flow
  const processAndSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true);

    const orgPayload: CreateOrganizationRequest = {
      long_name: data.long_name,
      short_name: data.short_name,
      email: data.email,
      description: data.description,
      legal_form: data.legal_form as OrganizationLegalForm,
      business_domains: data.business_domains,
      logo_url: data.logo_url,
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
      capital_share:
        data.capital_share == null ? undefined : data.capital_share,
      registration_date: data.registration_date?.toISOString(),
      year_founded: data.year_founded?.toISOString(),
      ceo_name: data.ceo_name,
      number_of_employees:
        data.number_of_employees == null ? undefined : data.number_of_employees,
    };

    const addressPayload: CreateAddressRequest = {
      address_line_1: data.address_line_1,
      address_line_2: data.address_line_2,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      country_id: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    try {
      if (mode === "create") {
        addressPayload.default = true;

        // Step 1: Create the organization
        const orgResponse = await organizationRepository.createOrganization(
          orgPayload
        );

        // Step 2: If org creation is successful, create its address
        if (orgResponse && orgResponse.organization_id) {
          try {
            await organizationRepository.createAddress(
              "ORGANIZATION",
              orgResponse.organization_id,
              addressPayload
            );
          } catch (addressError: any) {
            // Log address error but still proceed, as the org was created.
            toast.error(
              `Organization created, but failed to save address: ${addressError.message}`
            );
          }
        } else {
          throw new Error("Failed to get organization ID after creation.");
        }

        // Step 3: All steps successful, now call success action
        toast.success(
          `Organization "${orgResponse.short_name}" created successfully!`
        );
        onFormSubmitSuccessAction(orgResponse);
      } else {
        // Edit mode
        const orgUpdateResponse =
          await organizationRepository.updateOrganization(
            organizationId!,
            orgPayload as UpdateOrganizationRequest
          );
        // In edit mode, address handling is more complex (update existing or create new).
        // This is handled in the `profile` page for now. We can enhance this later if needed.
        toast.success(`Organization updated successfully!`);
        onFormSubmitSuccessAction(orgUpdateResponse);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${mode} organization.`);
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

  if (mode === "edit") {
    /* ... same edit mode return ... */
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(processAndSubmit, onInvalidSubmit)}
          className="space-y-6"
        >
          <OrgBasicInfoForm
            form={form}
            filteredDomains={filteredDomains}
            domainSearch={domainSearch}
            onDomainSearchChangeAction={setDomainSearch}
          />
          <OrgLegalForm form={form} />
          <OrgBrandingForm form={form} />
          <OrgAddressForm
            form={form}
            title="Primary Address"
            description="Update the main address for your organization."
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Save All Changes
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    /* ... same create mode wizard return ... */
    <Form {...form}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Organization</h2>
          <div className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {formSteps.length}
          </div>
        </div>
        <Tabs
          value={formSteps[currentStep].id}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            {formSteps.map((step, index) => (
              <TabsTrigger
                key={step.id}
                value={step.id}
                disabled={index > currentStep}
              >
                <step.icon className="mr-2 h-4 w-4" />
                {step.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-4 min-h-[400px]">{renderCurrentStep()}</div>
        </Tabs>
        <CardFooter className="flex justify-between mt-6 px-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep((p) => p - 1)}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          {currentStep < formSteps.length - 1 ? (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isLoading}
              onClick={form.handleSubmit(processAndSubmit, onInvalidSubmit)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Finish & Create Organization
            </Button>
          )}
        </CardFooter>
      </div>
    </Form>
  );
}
