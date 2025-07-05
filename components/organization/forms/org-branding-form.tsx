"use client";

import { useFieldArray } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Link as LinkIcon, Trash2, PlusCircle } from "lucide-react";

export function OrgBrandingForm({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "social_networks",
  });

  return (
    <CardContent className="space-y-6">
      <FormField name="logoFile" control={form.control} render={({ field }) => (
        <FormItem><FormLabel>Organization Logo</FormLabel>
          <FormControl><ImageUploader currentImageUrl={form.getValues("logo_url")} onImageSelectedAction={(file, url) => { field.onChange(file); form.setValue("logo_url", url); }} label="" aspectRatio="square" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField name="web_site_url" control={form.control} render={({ field }) => (<FormItem><FormLabel>Website URL</FormLabel><FormControl><Input type="url" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>)} />
      <div className="space-y-3">
        <FormLabel>Social Media Links</FormLabel>
        {fields.map((field, index) => (
          <FormField key={field.id} control={form.control} name={`social_networks.${index}.url`} render={({ field }) => (
            <FormItem><div className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-muted-foreground" /><FormControl><Input placeholder="https://facebook.com/your-page" {...field} /></FormControl>
              {fields.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive h-9 w-9 flex-shrink-0"><Trash2 className="h-4 w-4" /></Button>)}
            </div><FormMessage />
            </FormItem>
          )} />
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "" })}><PlusCircle className="mr-2 h-4 w-4" /> Add Social Link</Button>
      </div>
      <FormField name="keywords" control={form.control} render={({ field }) => (<FormItem><FormLabel>Keywords</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Comma-separated values (e.g., tech, saas).</FormDescription><FormMessage /></FormItem>)} />
      <FormField name="number_of_employees" control={form.control} render={({ field }) => (<FormItem><FormLabel>Number of Employees</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
    </CardContent>
  );
}
