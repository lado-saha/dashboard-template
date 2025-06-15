"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressDto,
  AddressableType,
} from "@/types/organization";
import { organizationApi } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"; // If used in a dialog
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Zod Schema for Address form
const addressFormSchema = z.object({
  address_line_1: z.string().min(3, "Address line 1 is required."),
  address_line_2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State/Province is required."), // Or make optional depending on needs
  zip_code: z.string().min(3, "Zip/Postal code is required."),
  country_id: z.string().uuid("Country selection is required.").optional(), // Assuming UUID from a select later
  // Add locality, neighbor_hood, latitude, longitude if needed
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
  addressableId: string;
  addressableType: AddressableType;
  initialData?: Partial<AddressDto>;
  mode: "create" | "edit";
  onSuccess: (data: AddressDto) => void;
  onCancel: () => void;
}

export function AddressForm({
  addressableId,
  addressableType,
  initialData,
  mode,
  onSuccess,
  onCancel,
}: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      address_line_1: initialData?.address_line_1 || "",
      address_line_2: initialData?.address_line_2 || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zip_code: initialData?.zip_code || "",
      country_id: initialData?.country_id || undefined,
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    setIsLoading(true);
    const requestPayload = { ...data }; // Map to CreateAddressRequest/UpdateAddressRequest

    try {
      let response: AddressDto;
      if (mode === "create") {
        // response = await organizationApi.createAddress(addressableType, addressableId, requestPayload as CreateAddressRequest);
        await new Promise((r) => setTimeout(r, 500)); // Mock
        response = {
          ...requestPayload,
          address_id: `addr-${Date.now()}`,
          is_default: false,
        } as AddressDto;
        toast.success("Address added successfully!");
      } else if (initialData?.address_id) {
        // response = await organizationApi.updateAddress(addressableType, addressableId, initialData.address_id, requestPayload as UpdateAddressRequest);
        await new Promise((r) => setTimeout(r, 500)); // Mock
        response = { ...initialData, ...requestPayload } as AddressDto;
        toast.success("Address updated successfully!");
      } else {
        throw new Error("Address ID missing for update.");
      }
      onSuccess(response);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${mode} address.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* DialogHeader can be part of the parent DialogContent */}
        {/* <DialogHeader> <DialogTitle>{mode === 'create' ? 'Add New Address' : 'Edit Address'}</DialogTitle> </DialogHeader> */}
        <FormField
          control={form.control}
          name="address_line_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address_line_2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2 (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State / Province</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip / Postal Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country_id"
            render={(
              { field } // Placeholder for country select
            ) => (
              <FormItem>
                <FormLabel>Country (Select TODO)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Country ID or use Select"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* DialogFooter can be part of the parent DialogContent */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Add Address" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
