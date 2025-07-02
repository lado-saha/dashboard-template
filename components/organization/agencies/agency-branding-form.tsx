"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

export function AgencyBrandingForm() {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding & Marketing</CardTitle>
        <CardDescription>
          Define the agency public-facing identity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="greeting_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Greeting Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Welcome to our branch!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="social_network"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Social Network URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/company/yowyob-west"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <Input placeholder="tech, west-coast, innovation" {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated keywords for searchability.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Image Gallery URLs</FormLabel>
          <FormDescription>
            Add URLs for images showcasing the agency.
          </FormDescription>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={control}
              name={`images.${index}`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.png"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive h-9 w-9 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
            onClick={() => append("")}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
