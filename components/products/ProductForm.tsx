"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ProductTypeEnum, // Keep this if used elsewhere in the file
  fullProductFormSchema,
  ProductFormData,
} from "@/lib/validators/productValidator";
import { resourceApi, serviceApi } from "@/lib/apiClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Loader2, ClockIcon, Settings2Icon } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductFormProps {
  initialData?: Partial<Omit<ProductFormData, 'scheduledAt'> & { id?: string; scheduledAt?: string | Date }>;
  onFormSubmitSuccess?: (data: any) => void;
  mode?: "create" | "edit";
}

const parseInitialScheduledAt = (scheduledAt?: string | Date): Date | undefined => {
  if (!scheduledAt) return undefined;
  if (scheduledAt instanceof Date && isValid(scheduledAt)) return scheduledAt;
  if (typeof scheduledAt === 'string') {
    const parsedDate = parseISO(scheduledAt);
    if (isValid(parsedDate)) return parsedDate;
  }
  return undefined;
};

export function ProductForm({
  initialData,
  onFormSubmitSuccess,
  mode = "create",
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  // Local state for conditional rendering, but primary source of truth for submission is form state
  const [enableScheduling, setEnableScheduling] = useState(initialData?.isScheduled || false);
  const [enableCustomAction, setEnableCustomAction] = useState(initialData?.isCustomAction || false);

  const formSchema = fullProductFormSchema;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productType: initialData?.productType || undefined,
      name: initialData?.name || "",
      description: initialData?.description || "",
      basePrice: initialData?.basePrice || undefined,
      isScheduled: initialData?.isScheduled || false,
      scheduledAt: parseInitialScheduledAt(initialData?.scheduledAt),
      isCustomAction: initialData?.isCustomAction || false,
      customActionQuery: initialData?.customActionQuery || "",
    },
  });

  // Watch the productType from react-hook-form state for conditional rendering
  const watchedProductType = form.watch("productType");

  useEffect(() => {
    const defaultVals = {
      productType: initialData?.productType || (mode === "create" ? "SERVICE" : watchedProductType),
      name: initialData?.name || "",
      description: initialData?.description || "",
      basePrice: initialData?.basePrice || undefined,
      isScheduled: initialData?.isScheduled || false,
      scheduledAt: parseInitialScheduledAt(initialData?.scheduledAt),
      isCustomAction: initialData?.isCustomAction || false,
      customActionQuery: initialData?.customActionQuery || "",
    };
    form.reset(defaultVals);

    setEnableScheduling(initialData?.isScheduled || false);
    setEnableCustomAction(initialData?.isCustomAction || false);

  }, [initialData, mode, form.reset, watchedProductType]); // Use watchedProductType from form

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setIsLoading(true);
    if (mode === "edit" && !initialData?.id) {
      toast.error("Product ID is missing for update operation.");
      setIsLoading(false);
      return;
    }
    if (!data.productType) { // Should be caught by Zod, but good to have a check
        toast.error("Product type is required.");
        setIsLoading(false);
        return;
    }

    try {
      const payload: any = {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        productType: data.productType, // Always include productType
      };

      payload.isScheduled = data.isScheduled || false; // Ensure boolean
      if (data.isScheduled && data.scheduledAt && isValid(data.scheduledAt)) {
        payload.scheduledAt = data.scheduledAt.toISOString();
      } else if (data.isScheduled && !data.scheduledAt){
        toast.error("Scheduled date is missing for a scheduled action."); setIsLoading(false); return;
      } else {
        delete payload.scheduledAt;
      }

      payload.isCustomAction = data.isCustomAction || false; // Ensure boolean
      if (data.isCustomAction && data.customActionQuery) {
        payload.customActionQuery = data.customActionQuery;
      } else if (data.isCustomAction && !data.customActionQuery) {
        toast.error("Custom query is missing for a custom action."); setIsLoading(false); return;
      } else {
        delete payload.customActionQuery;
      }

      if (mode === "edit" && initialData?.id) payload.id = initialData.id;
      let response;

      if (data.productType === "RESOURCE") {
        if (mode === "create") {
          response = data.isScheduled ? await resourceApi.scheduleCreate(payload) : await resourceApi.create(payload);
        } else {
          response = data.isScheduled
            ? await resourceApi.scheduleUpdate({ ...payload, id: initialData!.id })
            : await resourceApi.update(initialData!.id!, payload);
        }
      } else if (data.productType === "SERVICE") {
         if (mode === "create") {
          response = data.isScheduled ? await serviceApi.scheduleCreate(payload) : await serviceApi.create(payload);
        } else {
          response = data.isScheduled
            ? await serviceApi.scheduleUpdate({ ...payload, id: initialData!.id })
            : await serviceApi.update(initialData!.id!, payload);
        }
      }
      // No else needed here because of the check at the start of onSubmit

      toast.success(`Product ${mode === "create" ? "created" : "updated"} successfully!`);
      if (onFormSubmitSuccess) onFormSubmitSuccess(response);
      if (mode === "create") {
        form.reset({ // Reset to a truly blank state for create mode
            productType: undefined, name: "", description: "", basePrice: undefined,
            isScheduled: false, scheduledAt: undefined,
            isCustomAction: false, customActionQuery: ""
        });
        // setSelectedProductType(undefined); // This is now driven by watchedProductType
        setEnableScheduling(false);
        setEnableCustomAction(false);
      }
    } catch (error: any) { console.error("Form submission error:", error);
    } finally { setIsLoading(false); }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">{mode === "create" ? "Create New Product/Service" : `Edit ${watchedProductType?.toLowerCase() || "Item"}`}</CardTitle>
        <CardDescription>
          Provide the necessary details for your {watchedProductType ? watchedProductType.toLowerCase() : "item"}.
          {mode === "edit" && initialData?.id && <span className="block text-xs mt-1 text-muted-foreground">Editing ID: {initialData.id}</span>}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-2 pb-6 px-4 sm:px-6">
            {/* Section 1: Core Information */}
            <div className="space-y-4 p-4 border rounded-md bg-background/50">
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Item Type <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          // Allow changing type only in create mode directly via UI
                          // In edit mode, type is fixed.
                          if (mode === "create") {
                            field.onChange(value);
                            // watchedProductType will update automatically due to form.watch
                          }
                        }}
                        value={field.value || ""} // Ensure value is not undefined for RadioGroup
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl><RadioGroupItem value="RESOURCE" disabled={mode === "edit"} /></FormControl>
                          <FormLabel className="font-normal text-sm">Resource</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl><RadioGroupItem value="SERVICE" disabled={mode === "edit"} /></FormControl>
                          <FormLabel className="font-normal text-sm">Service</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedProductType && ( // Use watchedProductType for conditional rendering
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input placeholder={`${watchedProductType === "RESOURCE" ? "Resource" : "Service"} name`} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField /* ... description ... */
                    control={form.control} name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Provide a detailed description..." {...field} rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField /* ... basePrice ... */
                    control={form.control} name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (USD)</FormLabel>
                        <FormControl><Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ""} step="0.01" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {watchedProductType && ( // Use watchedProductType here as well
              <>
                {/* Section 2: Scheduling Options */}
                <div className="space-y-4 p-4 border rounded-md bg-background/50">
                    {/* ... Scheduling FormField for isScheduled ... */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base font-semibold flex items-center"><ClockIcon className="mr-2 h-5 w-5 text-primary"/>Scheduling Options</FormLabel>
                            <FormDescription className="text-xs">
                                Configure if this operation should occur at a future time.
                            </FormDescription>
                        </div>
                        <FormField control={form.control} name="isScheduled" render={({ field }) => (
                            <FormControl>
                                <Switch
                                    checked={field.value || false}
                                    onCheckedChange={(checked) => {
                                    field.onChange(checked); setEnableScheduling(checked);
                                    if (!checked) form.setValue("scheduledAt", undefined, { shouldValidate: true });
                                    }}
                                    aria-labelledby="scheduling-label"
                                />
                            </FormControl>
                        )}/>
                    </div>
                    {enableScheduling && ( /* ... FormField for scheduledAt ... */
                      <div className="pt-2 pl-1">
                        <FormField
                            control={form.control} name="scheduledAt"
                            render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-sm mb-1">Scheduled Date & Time <span className="text-destructive">*</span></FormLabel>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal h-10", !field.value && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value && isValid(field.value) ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single" selected={field.value}
                                        onSelect={(date) => { /* ... onSelect logic ... */
                                            const newDate = date || new Date(); const currentTime = field.value && isValid(field.value) ? field.value : new Date();
                                            newDate.setHours(currentTime.getHours()); newDate.setMinutes(currentTime.getMinutes()); newDate.setSeconds(0,0);
                                            field.onChange(newDate);
                                        }}
                                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus
                                    />
                                    <div className="p-2 border-t"><Input type="time"
                                        defaultValue={field.value && isValid(field.value) ? format(field.value, "HH:mm") : ""}
                                        onChange={(e) => { /* ... time input onChange logic ... */
                                            const time = e.target.value; const currentDate = field.value && isValid(field.value) ? new Date(field.value) : new Date();
                                            if (time) { const [hours, minutes] = time.split(':').map(Number); currentDate.setHours(hours, minutes, 0, 0); field.onChange(currentDate); }
                                        }}
                                        className="w-full h-9" />
                                    </div>
                                </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                      </div>
                    )}
                </div>

                {/* Section 3: Custom Action */}
                <div className="space-y-4 p-4 border rounded-md bg-background/50">
                    {/* ... Custom Action FormField for isCustomAction ... */}
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base font-semibold flex items-center"><Settings2Icon className="mr-2 h-5 w-5 text-primary"/>Advanced: Custom Action</FormLabel>
                            <FormDescription className="text-xs"> For specific backend operations requiring a custom query. </FormDescription>
                        </div>
                        <FormField control={form.control} name="isCustomAction" render={({ field }) => (
                            <FormControl>
                                <Switch
                                    checked={field.value || false}
                                    onCheckedChange={(checked) => {
                                    field.onChange(checked); setEnableCustomAction(checked);
                                    if (!checked) form.setValue("customActionQuery", "", { shouldValidate: true });
                                    }}
                                />
                            </FormControl>
                        )}/>
                    </div>
                    {enableCustomAction && ( /* ... FormField for customActionQuery ... */
                      <div className="pt-2 pl-1">
                        <FormField
                            control={form.control} name="customActionQuery"
                            render={({ field }) => (
                            <FormItem>
                          
                                <FormLabel className="text-sm">Custom Action Query <span className="text-destructive">*</span></FormLabel>
                                <FormControl><Input  placeholder="e.g., {'action': 'applyDiscount', 'rate': 0.1}" {...field} value={field.value ?? ""} /></FormControl>
                                <FormDescription className="text-xs">Enter JSON or string query for the custom action.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                      </div>
                    )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="border-t px-4 sm:px-6 py-4">
            <Button type="submit" disabled={isLoading || !watchedProductType} className="w-full sm:w-auto ml-auto"> {/* Use watchedProductType */}
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Processing..." : (mode === "create" ? `Create ${watchedProductType?.toLocaleLowerCase() || "Item"}` : "Save Changes")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}