"use client";

import React, { useState } from "react";
import { ProductListItemData } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, isValid } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
// Assume an API function for creating reservations will exist in apiClient.ts
// import { reservationApi } from "@/lib/apiClient";

interface ReservationModalProps {
  product?: ProductListItemData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReservationSuccess: () => void; // Callback after successful reservation
}

interface ReservationFormData {
  preferredDate?: Date;
  notes?: string;
}

export function ReservationModal({ product, isOpen, onOpenChange, onReservationSuccess }: ReservationModalProps) {
  const [formData, setFormData] = useState<ReservationFormData>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleDateSelect = (date?: Date) => {
    setFormData(prev => ({ ...prev, preferredDate: date }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }));
  };

  const handleSubmitReservation = async () => {
    if (!product) return;
    setIsLoading(true);

    // Basic validation (can be expanded with Zod)
    if (product.productType === "SERVICE" && !formData.preferredDate) {
      toast.error("Please select a preferred date for the service.");
      setIsLoading(false);
      return;
    }

    console.log("Submitting reservation for:", product.id, "with data:", formData);

    // SIMULATE API CALL
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      // const reservationPayload = {
      //   productId: product.id,
      //   productType: product.productType,
      //   preferredDate: formData.preferredDate?.toISOString(),
      //   notes: formData.notes,
      //   // customerId would be added on the backend from the session/token
      // };
      // await reservationApi.create(reservationPayload); // Example API call

      toast.success(`Reservation request for "${product.name}" submitted!`);
      onReservationSuccess();
      onOpenChange(false); // Close modal
      setFormData({}); // Reset form
    } catch (error: any)  {
      console.error("Reservation submission error:", error);
      toast.error(error.message || "Failed to submit reservation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reserve: {product.name}</DialogTitle>
          <DialogDescription>
            Confirm your interest or select preferences for this {product.productType.toLowerCase()}.
            {product.basePrice && <span className="block mt-1">Price: ${product.basePrice.toFixed(2)}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {product.productType === "SERVICE" && ( // Date picker typically for services
            <div className="space-y-1.5">
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !formData.preferredDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.preferredDate && isValid(formData.preferredDate) ? format(formData.preferredDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.preferredDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Additional Notes or Questions</Label>
            <Textarea
              id="notes"
              placeholder={`Any specific requests for ${product.name}? (Optional)`}
              value={formData.notes || ""}
              onChange={handleNotesChange}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmitReservation} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Submitting..." : (product.productType === "RESOURCE" ? "Express Interest" : "Submit Request")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}