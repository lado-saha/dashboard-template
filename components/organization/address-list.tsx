"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AddressDto, AddressableType } from "@/lib/types/organization";
import { organizationApi } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddressForm } from "./address-form"; // Assuming this path
import { PlusCircle, Edit2, Trash2, Star, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AddressListProps {
  organizationId: string; // The ID of the parent organization or agency
  contactableType: AddressableType; // e.g., "ORGANIZATION", "AGENCY"
}

export function AddressList({
  organizationId,
  contactableType,
}: AddressListProps) {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressDto | undefined>(
    undefined
  );

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      // const data = await organizationApi.getAddresses(contactableType, organizationId); // REAL API CALL
      await new Promise((r) => setTimeout(r, 500)); // Mock
      const mockData: AddressDto[] = [
        {
          address_id: "addr-1",
          address_line_1: "123 Main St",
          city: "Anytown",
          state: "CA",
          zip_code: "90210",
          is_default: true,
          country_id: "country-uuid-us",
        },
        {
          address_id: "addr-2",
          address_line_1: "456 Oak Ave",
          address_line_2: "Suite 100",
          city: "Otherville",
          state: "NY",
          zip_code: "10001",
          country_id: "country-uuid-us",
        },
      ];
      setAddresses(mockData);
    } catch (error) {
      toast.error("Failed to load addresses.");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, contactableType]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleFormSuccess = (address: AddressDto) => {
    fetchAddresses(); // Refresh list
    setIsFormModalOpen(false);
    setEditingAddress(undefined);
  };

  const handleEdit = (address: AddressDto) => {
    setEditingAddress(address);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (addressId?: string) => {
    if (!addressId || !confirm("Are you sure you want to delete this address?"))
      return;
    try {
      // await organizationApi.deleteAddress(contactableType, organizationId, addressId); // REAL API CALL
      await new Promise((r) => setTimeout(r, 300)); // Mock
      toast.success("Address deleted.");
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address.");
    }
  };

  const handleSetDefault = async (addressId?: string) => {
    if (!addressId) return;
    // This API might not exist directly as "markAsFavorite" in spec is for contactId.
    // It might be part of the UpdateAddressRequest to set an `is_default` flag.
    toast.info(`Set default functionality for address ${addressId} TBD.`);
    // await organizationApi.markAddressFavorite(contactableType, organizationId, addressId)
    // fetchAddresses();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingAddress(undefined);
              setIsFormModalOpen(true);
            }}
            className="mb-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Address
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Update the details of this address."
                : "Enter the details for the new address."}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            addressableId={organizationId}
            addressableType={contactableType}
            initialData={editingAddress}
            mode={editingAddress ? "edit" : "create"}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormModalOpen(false);
              setEditingAddress(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No addresses found.
        </p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.address_id}
              className="p-3 border rounded-md flex justify-between items-start text-sm"
            >
              <div>
                <p className="font-medium text-foreground">
                  {addr.address_line_1}
                  {addr.address_line_2 && `, ${addr.address_line_2}`}
                </p>
                <p className="text-muted-foreground">
                  {addr.city}, {addr.state} {addr.zip_code}{" "}
                  {addr.country_id
                    ? `(${addr.country_id.substring(0, 2).toUpperCase()})`
                    : ""}
                </p>
                {addr.is_default && (
                  <Badge variant="default" className="mt-1 text-xs">
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {!addr.is_default && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleSetDefault(addr.address_id)}
                    title="Set as default"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEdit(addr)}
                  title="Edit address"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
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
