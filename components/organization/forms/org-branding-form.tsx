"use client";

import { useFieldArray } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Link as LinkIcon, Trash2, PlusCircle } from "lucide-react";

export const brandingSchema = z.object({
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
  ceo_name: z.string().optional().or(z.literal("")),
  number_of_employees: z.coerce
    .number()
    .int()
    .min(0, "Number of employees cannot be negative.")
    .optional()
    .nullable(),
});

export type BrandingFormData = z.infer<typeof brandingSchema>;

interface BrandingFormProps {
  form: any;
}

export function OrgBrandingForm({ form }: BrandingFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "social_networks",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding & Details</CardTitle>
        <CardDescription>
          Add your logo, web presence, and other operational details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          name="logo_url"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <ImageUploader
                  currentImageUrl={field.value}
                  onImageSelectedAction={(file, url) => field.onChange(url)}
                  label=""
                  aspectRatio="square"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="web_site_url"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input type="url" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Social Media Links</FormLabel>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`social_networks.${index}.url`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="https://facebook.com/your-page"
                        {...field}
                      />
                    </FormControl>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive h-9 w-9 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ url: "" })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Social Link
          </Button>
        </div>

        <FormField
          name="keywords"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated values (e.g., tech, saas).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
