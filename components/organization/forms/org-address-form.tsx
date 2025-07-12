"use client";

import React, { useState, useEffect } from "react";
import * as z from "zod";
import { LatLngExpression } from "leaflet";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,

} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MapView } from "@/components/map/map-view";
import { mapRepository } from "@/lib/data-repo/map";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const addressSchema = z.object({
  address_line_1: z.string().min(3, "Address line 1 is required."),
  address_line_2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State/Province is required."),
  zip_code: z.string().min(3, "Zip/Postal code is required."),
  country: z.string().min(2, "Country is required."),
  latitude: z.coerce
    .number()
    .min(-90, "Invalid Latitude")
    .max(90, "Invalid Latitude")
    .optional(),
  longitude: z.coerce
    .number()
    .min(-180, "Invalid Longitude")
    .max(180, "Invalid Longitude")
    .optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

interface OrgAddressFormProps {
  form: any;
  title?: string;
  description?: string;
}

const DEFAULT_CENTER: LatLngExpression = [51.505, -0.09];
const DEFAULT_ZOOM = 4;

export function OrgAddressForm({
  form,
  title = "Headquarters Address",
  description = "Provide the primary address. Click the map or enter coordinates to pinpoint the location.",
}: OrgAddressFormProps) {
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>(
    null
  );
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { watch, getValues, setValue } = form;

  // REFINED LOGIC: Separate watch for coordinates to drive the map marker directly.
  const watchedCoords = watch(["latitude", "longitude"]);

  // Effect to initialize or update map from coordinate fields
  useEffect(() => {
    const [lat, lon] = watchedCoords;
    if (typeof lat === "number" && typeof lon === "number") {
      const newPos: LatLngExpression = [lat, lon];
      // Check if marker needs updating to avoid unnecessary re-renders
      const currentMarker = markerPosition as [number, number] | null;
      if (currentMarker?.[0] !== lat || currentMarker?.[1] !== lon) {
        setMarkerPosition(newPos);
        setMapCenter(newPos);
        setMapZoom(16);
      }
    }
  }, [watchedCoords, markerPosition]); // Reruns when lat/lon fields change

  const handleLocationSelectAction = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    toast.loading("Fetching address from coordinates...");
    try {
      setValue("latitude", parseFloat(lat.toFixed(6)), {
        shouldValidate: true,
      });
      setValue("longitude", parseFloat(lng.toFixed(6)), {
        shouldValidate: true,
      });
      // The useEffect above will handle setting the marker position

      const data = await mapRepository.reverseGeocode(lat, lng);
      if (data?.address) {
        const addressLine1 = [data.address.house_number, data.address.road]
          .filter(Boolean)
          .join(" ");
        setValue("address_line_1", addressLine1, { shouldValidate: true });
        setValue("city", data.address.city || data.address.municipality || "", {
          shouldValidate: true,
        });
        setValue(
          "state",
          data.address.state || data.address.state_district || "",
          { shouldValidate: true }
        );
        setValue("zip_code", data.address.postcode || "", {
          shouldValidate: true,
        });
        setValue("country", data.address.country || "", {
          shouldValidate: true,
        });
        toast.success("Address updated from map!");
      } else {
        toast.warning("Could not find a specific address for this location.");
      }
    } catch (error) {
      toast.error("Failed to fetch address.");
    } finally {
      setIsGeocoding(false);
      toast.dismiss();
    }
  };

  // This logic for searching based on address text remains separate and tied to the search button.
  const handleSearchAddressAction = async () => {
    const addressParts = [
      getValues("address_line_1"),
      getValues("city"),
      getValues("state"),
      getValues("country"),
    ];
    const fullAddress = addressParts.filter(Boolean).join(", ");
    if (fullAddress.length < 5) {
      toast.info("Please enter an address to search.");
      return;
    }

    setIsGeocoding(true);
    toast.loading("Searching for address...");
    try {
      const results = await mapRepository.geocodeAddress(fullAddress);
      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        setValue("latitude", parseFloat(lat), { shouldValidate: true });
        setValue("longitude", parseFloat(lon), { shouldValidate: true });
        toast.success("Address found on map!");
      } else {
        toast.warning("Could not find this address.");
      }
    } catch (error) {
      toast.error("Failed to search address.");
    } finally {
      toast.dismiss();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <FormField
                name="address_line_1"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Address Line 1 *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 1600 Amphitheatre Pkwy"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSearchAddressAction}
                disabled={isGeocoding}
                title="Search Address on Map"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <FormField
              name="address_line_2"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Suite 100" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="city"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="state"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="zip_code"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip/Postal Code *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="country"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <FormField
                name="latitude"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="longitude"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div
            className={cn(
              "relative rounded-md overflow-hidden min-h-[400px] transition-all duration-300",
              isFullscreen && "fixed inset-0 z-50"
            )}
          >
            {isGeocoding && !isFullscreen && (
              <div className="absolute inset-0 bg-background/50 z-20 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            <MapView
              center={mapCenter}
              zoom={mapZoom}
              markers={
                markerPosition
                  ? [{ id: "selected", position: markerPosition }]
                  : []
              }
              onLocationSelectAction={handleLocationSelectAction}
              isLocationPicker={true}
              className="h-full w-full"
              isFullscreen={isFullscreen}
              onToggleFullscreenAction={() => setIsFullscreen(!isFullscreen)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
