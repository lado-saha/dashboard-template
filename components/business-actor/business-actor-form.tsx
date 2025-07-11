"use client";

import React, { useState, useEffect } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { organizationRepository } from "@/lib/data-repo/organization";
import { mediaRepository } from "@/lib/data-repo/media";
import {
  CreateBusinessActorRequest,
  BusinessActorTypeValues,
  GenderValues,
  BusinessActorDto,
  UpdateBusinessActorRequest,
} from "@/types/organization";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ImageUploader } from "@/components/ui/image-uploader";
import { FormWizard } from "@/components/ui/form-wizard";
import {
  Loader2,
  User,
  Briefcase,
  Mail,
  CalendarIcon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isValid } from "date-fns";
import { Switch } from "../ui/switch";
import { embedId } from "@/lib/id-parser";

const personalInfoSchema = z.object({
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  gender: z.enum(GenderValues, { required_error: "Gender is required." }),
  birth_date: z
    .date({ required_error: "Date of birth is required." })
    .max(new Date(), "Date of birth cannot be in the future."),
  nationality: z.string().min(2, "Nationality is required."),
  is_individual: z.boolean().default(true),
});

const professionalInfoSchema = z.object({
  type: z.enum(BusinessActorTypeValues, {
    required_error: "Actor type is required.",
  }),
  profession: z.string().min(2, "Profession is required."),
  biography: z.string().min(10, "A brief biography is required.").max(500),
});

const contactAndMediaSchema = z.object({
  email: z.string().email("A valid contact email is required."),
  phone_number: z.string().optional().or(z.literal("")),
  avatarFile: z.any().optional(),
  profileFile: z.any().optional(),
  avatar_picture: z
    .string()
    .url("Invalid URL")
    .or(z.literal(""))
    .nullable()
    .optional(),
  profile_picture: z
    .string()
    .url("Invalid URL")
    .or(z.literal(""))
    .nullable()
    .optional(),
});

const fullBASchema = personalInfoSchema
  .merge(professionalInfoSchema)
  .merge(contactAndMediaSchema);
type BAFormData = z.infer<typeof fullBASchema>;

const formSteps = [
  {
    id: "personal",
    name: "Personal Details",
    icon: User,
    fields: Object.keys(personalInfoSchema.shape) as (keyof BAFormData)[],
  },
  {
    id: "professional",
    name: "Professional Info",
    icon: Briefcase,
    fields: Object.keys(professionalInfoSchema.shape) as (keyof BAFormData)[],
  },
  {
    id: "contact",
    name: "Contact & Media",
    icon: Mail,
    fields: Object.keys(contactAndMediaSchema.shape) as (keyof BAFormData)[],
  },
];

interface BusinessActorFormProps {
  mode: "create" | "edit";
  initialData?: Partial<BusinessActorDto>;
  onSuccessAction: (data: BusinessActorDto) => void;
}

export function BusinessActorForm({
  mode,
  initialData,
  onSuccessAction,
}: BusinessActorFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<BAFormData>({
    resolver: zodResolver(fullBASchema),
    mode: "onChange",
    defaultValues: {
      first_name: initialData?.first_name || session?.user.first_name || "",
      last_name: initialData?.last_name || session?.user.last_name || "",
      gender: initialData?.gender || undefined,
      birth_date:
        initialData?.birth_date && isValid(new Date(initialData.birth_date))
          ? new Date(initialData.birth_date)
          : undefined,
      nationality: initialData?.nationality || "",
      is_individual: initialData?.is_individual ?? true,
      type: initialData?.type || undefined,
      profession: initialData?.profession || "",
      biography: initialData?.biography ? initialData.biography : "",
      email: initialData?.email || session?.user.email || "",
      phone_number:
        initialData?.phone_number || session?.user.phone_number || "",
      avatar_picture: initialData?.avatar_picture || "",
      profile_picture: initialData?.profile_picture || "",
    },
  });

  const handleNextStep = async () => {
    const fieldsToValidate = formSteps[currentStep].fields;
    const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true });
    if (isValid) {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      toast.error("Please fill out all required fields on this step.");
    }
  };

  const onInvalid = (errors: FieldErrors<BAFormData>) => {
    toast.error("Please fix the errors on all steps before submitting.");
    for (const [index, step] of formSteps.entries()) {
      if (step.fields.some((field) => Object.keys(errors).includes(field))) {
        setCurrentStep(index);
        break;
      }
    }
  };

  const onSubmit = async (data: BAFormData) => {
    if (!session?.user.id) {
      toast.error("User session not found. Please log in again.");
      return;
    }
    setIsLoading(true);

    let avatarUrl: string | undefined | null = form.getValues("avatar_picture");
    let profileUrl: string | undefined | null =
      form.getValues("profile_picture");

    try {
      if (data.avatarFile instanceof File) {
        toast.loading("Uploading avatar...");
        const response = await mediaRepository.uploadFile(
          "business-actor",
          "image",
          "avatars",
          session.user.id,
          data.avatarFile
        );
        avatarUrl = response.url;
        toast.dismiss();
      } else if (data.avatar_picture === null) {
        avatarUrl = null;
      }

      if (data.profileFile instanceof File) {
        toast.loading("Uploading profile picture...");
        const response = await mediaRepository.uploadFile(
          "business-actor",
          "image",
          "profiles",
          session.user.id,
          data.profileFile
        );
        profileUrl = response.url;
        toast.dismiss();
      } else if (data.profile_picture === null) {
        profileUrl = null;
      }

      const biographyWithId = embedId(
        data.biography,
        "user_id",
        session.user.id
      );

      const payload: CreateBusinessActorRequest | UpdateBusinessActorRequest = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        gender: data.gender,
        birth_date: data.birth_date.toISOString(),
        nationality: data.nationality,
        type: data.type,
        profession: data.profession,
        biography: biographyWithId,
        avatar_picture: avatarUrl ?? undefined,
        profile_picture: profileUrl ?? undefined,
        is_individual: data.is_individual,
      };

      if (mode === "edit" && initialData?.business_actor_id) {
        const updatedBA = await organizationRepository.updateBusinessActor(
          initialData.business_actor_id,
          payload
        );
        onSuccessAction(updatedBA);
      } else {
        const newBA = await organizationRepository.createBusinessActor(
          payload as CreateBusinessActorRequest
        );
        onSuccessAction(newBA);
      }
    } catch (error: any) {
      toast.error(error.message || `An error occurred during profile ${mode}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    const isFormValid = await form.trigger();
    if (isFormValid) {
      await onSubmit(form.getValues());
    } else {
      onInvalid(form.formState.errors);
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardContent className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="space-y-8"
          >
            <FormWizard
              steps={formSteps}
              currentStepIndex={currentStep}
              onStepClick={setCurrentStep}
              mode={mode}
            />
            <div className="">
              {/* --- Step 1: Personal Details --- */}
              <div className={cn(currentStep !== 0 && "hidden")}>
                <div className="border-b pb-4 mb-6">
                  <h3 className="text-xl font-semibold leading-6 text-foreground">
                    Personal Details
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Provide your basic personal information.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
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
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GenderValues.map((g) => (
                                <SelectItem key={g} value={g}>
                                  {g}
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
                      name="birth_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                                initialFocus
                                captionLayout="dropdown-buttons"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., American" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_individual"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Individual Actor</FormLabel>
                          <FormDescription>
                            Is this profile for an individual or a company
                            entity?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* --- Step 2: Professional Info --- */}
              <div className={cn(currentStep !== 1 && "hidden")}>
                <div className="border-b pb-4 mb-6">
                  <h3 className="text-xl font-semibold leading-6 text-foreground">
                    Professional Information
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Describe your professional role and background.
                  </p>
                </div>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actor Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your primary role..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BusinessActorTypeValues.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This defines your main function on the platform.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession / Job Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Software Engineer"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="biography"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biography *</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            placeholder="Tell us a little about your professional background..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* --- Step 3: Contact & Media --- */}
              <div className={cn(currentStep !== 2 && "hidden")}>
                <div className="border-b pb-4 mb-6">
                  <h3 className="text-xl font-semibold leading-6 text-foreground">
                    Contact & Media
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Provide contact details and upload profile images.
                  </p>
                </div>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1234567890"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <FormField
                      control={form.control}
                      name="avatarFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar (Square)</FormLabel>
                          <FormControl>
                            <ImageUploader
                              currentImageUrl={form.getValues("avatar_picture")}
                              onImageSelectedAction={(file, url) => {
                                field.onChange(file);
                                form.setValue("avatar_picture", url);
                              }}
                              aspectRatio="square"
                              fallbackName={form.getValues("first_name")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profileFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Picture (Wider)</FormLabel>
                          <FormControl>
                            <ImageUploader
                              currentImageUrl={form.getValues(
                                "profile_picture"
                              )}
                              onImageSelectedAction={(file, url) => {
                                field.onChange(file);
                                form.setValue("profile_picture", url);
                              }}
                              aspectRatio="landscape"
                              fallbackName={form.getValues("first_name")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

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
                  onClick={handleFinalSubmit}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mode === "create"
                    ? "Finish & Submit Profile"
                    : "Save Changes"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
