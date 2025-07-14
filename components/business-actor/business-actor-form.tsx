"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { UserDto } from "@/types/auth";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { isValid } from "date-fns";
import { Button } from "../ui/button";

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

const adminSchema = z.object({
  user_id: z
    .string({ required_error: "You must select a user." })
    .min(1, "You must select a user."),
});

const fullBASchema = personalInfoSchema
  .merge(professionalInfoSchema)
  .merge(contactAndMediaSchema)
  .merge(adminSchema.partial()); // Make admin fields optional by default

interface BusinessActorFormProps {
  mode: "create" | "edit";
  initialData?: Partial<BusinessActorDto>;
  onSuccessAction: (data: BusinessActorDto) => void;
  onCancelAction: () => void;
  isAdminMode?: boolean;
  users?: UserDto[];
}

export function BusinessActorForm({
  mode,
  initialData,
  onSuccessAction,
  onCancelAction,
  isAdminMode = false,
  users = [],
}: BusinessActorFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = useMemo(() => {
    if (isAdminMode && mode === "create") {
      return fullBASchema.required({ user_id: true });
    }
    return fullBASchema;
  }, [isAdminMode, mode]);

  type BAFormData = z.infer<typeof formSchema>;

  const form = useForm<BAFormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      gender: initialData?.gender,
      birth_date:
        initialData?.birth_date && isValid(new Date(initialData.birth_date))
          ? new Date(initialData.birth_date)
          : undefined,
      nationality: initialData?.nationality || "",
      is_individual: initialData?.is_individual ?? true,
      type: initialData?.type,
      profession: initialData?.profession || "",
      biography: initialData?.biography || "",
      email: initialData?.email || "",
      phone_number: initialData?.phone_number || "",
      avatar_picture: initialData?.avatar_picture || "",
      profile_picture: initialData?.profile_picture || "",
  
    },
  });

  const onSubmit = async (data: BAFormData) => {
    setIsLoading(true);
    const userIdForUpload =
      mode === "edit" ? initialData?.business_actor_id : data.user_id;
    if (!userIdForUpload) {
      toast.error("Target user ID is missing.");
      setIsLoading(false);
      return;
    }

    try {
      let avatarUrl = data.avatar_picture;
      if (data.avatarFile instanceof File) {
        const res = await mediaRepository.uploadFile(
          "business-actor",
          "image",
          "avatars",
          userIdForUpload,
          data.avatarFile
        );
        avatarUrl = res.url;
      }

      const payload: CreateBusinessActorRequest | UpdateBusinessActorRequest = {
        ...data,
        birth_date: data.birth_date.toISOString(),
        avatar_picture: avatarUrl ?? undefined,
      };

      if (mode === "edit" && initialData?.business_actor_id) {
        const updatedBA = await organizationRepository.updateBusinessActor(
          initialData.business_actor_id,
          payload
        );
        toast.success("Business Actor profile updated successfully!");
        onSuccessAction(updatedBA);
      } else {
        const newBA = await organizationRepository.createBusinessActor(
          payload as CreateBusinessActorRequest
        );
        toast.success(
          `Business Actor profile created for ${newBA.first_name}.`
        );
        onSuccessAction(newBA);
      }
    } catch (error: any) {
      toast.error(error.message || `An error occurred.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isAdminMode && (
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User to Assign *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={mode === "edit"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user to create a profile for..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id!}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mode === "edit" && (
                  <FormDescription>
                    The assigned user cannot be changed.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {/* All other form fields remain the same, wrapped in their respective sections */}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email *</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actor Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BusinessActorTypeValues.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelAction}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Profile" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
