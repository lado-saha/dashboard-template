"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateAgencyRequest, BusinessDomainDto } from "@/types/organization";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Info, FileText, Building, ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { AgencyBasicInfoForm } from "./agency-basic-info-form";
import { AgencyLegalForm } from "./agency-legal-form";
import { AgencyBrandingForm } from "./agency-branding-form";

// Define schema for each step
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
}

export function AgencyForm({ organizationId }: AgencyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [availableBusinessDomains, setAvailableBusinessDomains] = useState<
    BusinessDomainDto[]
  >([]);
  const [domainSearch, setDomainSearch] = useState("");

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

  const form = useForm<AgencyFormData>({
    resolver: zodResolver(fullAgencySchema),
    mode: "onChange",
    defaultValues: { business_domains: [], transferable: false, images: [] },
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
    const currentStepIndex = formSteps.findIndex(
      (step) => step.id === activeTab
    );
    const fieldsToValidate = formSteps[currentStepIndex].fields;
    const isStepValid = await form.trigger(
      fieldsToValidate as (keyof AgencyFormData)[]
    );
    if (isStepValid) {
      if (currentStepIndex < formSteps.length - 1) {
        setActiveTab(formSteps[currentStepIndex + 1].id);
      }
    } else {
      toast.error("Please fix the errors on this page before proceeding.");
    }
  };

  async function onSubmit(data: AgencyFormData) {
    setIsLoading(true);
    const payload: CreateAgencyRequest = {
      ...data,
      registration_date: data.registration_date?.toISOString(),
    };
    try {
      const newAgency = await organizationRepository.createAgency(
        organizationId,
        payload
      );
      toast.success(`Agency "${newAgency.short_name}" created successfully!`);
      router.push("/business-actor/org/agencies");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create agency.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Agencies
          </Button>
          <div className="text-sm font-medium text-muted-foreground">
            Step {formSteps.findIndex((s) => s.id === activeTab) + 1} of{" "}
            {formSteps.length}
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {formSteps.map((step) => (
              <TabsTrigger key={step.id} value={step.id}>
                <step.icon className="mr-2 h-4 w-4" />
                {step.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic" className="mt-4">
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
          </TabsContent>
          <TabsContent value="legal" className="mt-4">
            <AgencyLegalForm />
          </TabsContent>
          <TabsContent value="branding" className="mt-4">
            <AgencyBrandingForm />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setActiveTab(
                formSteps[formSteps.findIndex((s) => s.id === activeTab) - 1].id
              )
            }
            disabled={activeTab === "basic"}
          >
            Back
          </Button>
          {activeTab !== "branding" ? (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Finish & Create Agency
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
