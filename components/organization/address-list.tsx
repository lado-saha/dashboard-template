"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AddressDto,
  AddressableType,
  CreateAddressRequest,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { OrgAddressForm, addressSchema } from "./forms/org-address-form";
import {
  PlusCircle,
  Edit2,
  Trash2,
  Star,
  MapPin,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapView } from "../map/map-view";
import { Form } from "@/components/ui/form";

interface AddressListProps {
  organizationId: string;
  addressableType: AddressableType;
}

export function AddressList({
  organizationId,
  addressableType,
}: AddressListProps) {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMapViewOpen, setIsMapViewOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressDto | undefined>(
    undefined
  );
  const [addressToView, setAddressToView] = useState<AddressDto | null>(null);

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line_1: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
    },
  });

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await organizationRepository.getAddresses(
        addressableType,
        organizationId
      );
      setAddresses(data || []);
    } catch (error) {
      toast.error("Failed to load addresses.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, addressableType]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleFormSubmit = async (data: z.infer<typeof addressSchema>) => {
    const payload = { ...data, country_id: data.country };
    if (editingAddress && editingAddress.address_id) {
      await organizationRepository.updateAddress(
        addressableType,
        organizationId,
        editingAddress.address_id,
        payload
      );
      toast.success("Address updated successfully!");
    } else {
      await organizationRepository.createAddress(
        addressableType,
        organizationId,
        payload as CreateAddressRequest
      );
      toast.success("Address added successfully!");
    }
    await fetchAddresses();
    setIsFormOpen(false);
    setEditingAddress(undefined);
  };

  const handleEdit = (address: AddressDto) => {
    form.reset({
      address_line_1: address.address_line_1 || "",
      address_line_2: address.address_line_2 || "",
      city: address.city || "",
      state: address.state || "",
      zip_code: address.zip_code || "",
      country: address.country_id || "",
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    form.reset({
      address_line_1: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
    });
    setEditingAddress(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (addressId?: string) => {
    if (!addressId || !confirm("Are you sure?")) return;
    try {
      await organizationRepository.deleteAddressById(
        addressableType,
        organizationId,
        addressId
      );
      toast.success("Address deleted.");
      fetchAddresses();
    } catch (error)  {
      toast.error(error.message || "Failed to delete address.");
    }
  };

  const handleSetDefault = async (addressId?: string) => {
    if (!addressId) return;
    try {
      await organizationRepository.markAddressAsFavorite(
        addressableType,
        organizationId,
        addressId
      );
      toast.success("Default address updated.");
      await fetchAddresses();
    } catch (error)  {
      toast.error(error.message || "Failed to set default address.");
    }
  };

  const handleViewOnMap = (address: AddressDto) => {
    setAddressToView(address);
    setIsMapViewOpen(true);
  };

  if (isLoading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    );

  return (
    <div className="space-y-4">
      <Button size="sm" variant="outline" onClick={handleCreate}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Address
      </Button>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        {/* THE FIX: Increased max-width for the address form dialog */}
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              {/* Note: The OrgAddressForm doesnapper here */}
              <OrgAddressForm form={form} title="" description="" />
              <DialogFooter className="mt-6 pt-4 border-t sm:justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isMapViewOpen} onOpenChange={setIsMapViewOpen}>
        <DialogContent className="max-w-3xl h-[70vh] flex flex-col p-2">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>Address Location</DialogTitle>
            <DialogDescription>
              {addressToView?.address_line_1}, {addressToView?.city}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow w-full h-full rounded-md overflow-hidden">
            {addressToView?.latitude && addressToView?.longitude && (
              <MapView
                center={[addressToView.latitude, addressToView.longitude]}
                zoom={16}
                markers={[
                  {
                    id: addressToView.address_id!,
                    position: [addressToView.latitude, addressToView.longitude],
                  },
                ]}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No addresses found.
        </p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.address_id}
              className="p-4 border rounded-lg flex justify-between items-start text-sm"
            >
              <div>
                <p className="font-semibold text-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  {addr.address_line_1}
                  {addr.address_line_2 && `, ${addr.address_line_2}`}
                </p>
                <p className="text-muted-foreground pl-6">
                  {addr.city}, {addr.state} {addr.zip_code}
                </p>
                {addr.is_default && (
                  <Badge
                    variant="secondary"
                    className="mt-2 ml-6 text-xs font-normal"
                  >
                    Default Address
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleViewOnMap(addr)}
                  title="View on map"
                  disabled={!addr.latitude || !addr.longitude}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {!addr.is_default && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleSetDefault(addr.address_id)}
                    title="Set as default"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(addr)}
                  title="Edit address"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(addr.address_id)}
                  title="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
