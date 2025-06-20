"use client";

import React from "react";
import { ProductListItemData } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format, parseISO, isValid } from "date-fns";
import {
  AlertTriangle, CalendarDays, Clock, DollarSign, FileText, InfoIcon as DetailInfoIcon, // Renamed to avoid conflict if needed
  TagIcon, TypeIcon, Edit3, XCircle,
  Package, Combine, CheckCircle, CircleDot, CircleSlash, ShoppingCart // Added ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image"; // Added Image import

interface ProductDetailViewProps {
  product?: ProductListItemData;
  onClose: () => void;
  onEditAction: (product: ProductListItemData) => void; // Retain for BA context
  onReserve?: (product: ProductListItemData) => void; // NEW: Optional for Customer context
  showReserveButton?: boolean; // NEW: To control visibility of reserve button
  isBAView?: boolean; // NEW: To control visibility of edit button (or other BA-specific actions)
}

const getStateDisplay = (state: string = ""): { variant: "default" | "secondary" | "outline" | "destructive", icon: React.ElementType, label: string } => {
  const upperState = state.toUpperCase();
  const label = upperState.toLowerCase().replace(/_/g, " ");
  switch (upperState) {
    case "FREE": case "AVAILABLE": case "PUBLISHED": case "FINISHED":
      return { variant: "default", icon: CheckCircle, label };
    case "AFFECTED": case "PLANNED":
      return { variant: "secondary", icon: Clock, label };
    case "IN_USE": case "ONGOING":
      return { variant: "outline", icon: CircleDot, label };
    case "CANCELLED": case "DELETED":
      return { variant: "destructive", icon: CircleSlash, label };
    default: return { variant: "outline", icon: DetailInfoIcon, label: label || "Unknown" };
  }
};

const DetailRow: React.FC<{ label: string; value?: string | number | React.ReactNode; icon: React.ElementType; className?: string }> = ({ label, value, icon: Icon, className }) => (
  <div className={cn("grid grid-cols-3 gap-2 py-3 items-start", className)}>
    <dt className="col-span-1 text-sm font-medium text-muted-foreground flex items-center">
      <Icon className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground/80" />
      {label}
    </dt>
    <dd className="col-span-2 text-sm text-foreground break-words">{value ?? <span className="italic text-muted-foreground/70">N/A</span>}</dd>
  </div>
);

export function ProductDetailView({
  product,
  onClose,
  onEditAction,
  onReserve, // New prop
  showReserveButton = false, // New prop
  isBAView = false // New prop to distinguish context
}: ProductDetailViewProps) {
  if (!product) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <Card className="w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" /> Product Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The selected product data could not be loaded or is unavailable.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const stateDisplay = getStateDisplay(product.currentState);
  const productTypeIcon = product.productType === "RESOURCE" ? Package : Combine;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <Card className="w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl rounded-lg" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="border-b p-4 sm:p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
                {product.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                ID: {product.id}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close detail view" className="-mt-1 -mr-1 sm:-mt-2 sm:-mr-2">
              <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-5 overflow-y-auto scrollbar-thin flex-1">
          {product.imageUrl && product.imageUrl !== "/placeholder.svg" && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
              <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover"/>
            </div>
          )}
          <section className="space-y-1">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">General Information</h3>
            <DetailRow label="Type" icon={TypeIcon} value={
              <Badge variant={product.productType === "RESOURCE" ? "outline" : "secondary"} className="capitalize text-xs font-normal">
                {React.createElement(productTypeIcon, { className: "mr-1.5 h-3.5 w-3.5" })}
                {product.productType.toLowerCase()}
              </Badge>
            } />
            <DetailRow label="Status" icon={stateDisplay.icon} value={
              <Badge variant={stateDisplay.variant} className="capitalize text-xs font-normal">
                {stateDisplay.label}
              </Badge>
            } />
            {product.basePrice !== undefined && product.basePrice !== null && (
              <DetailRow label="Base Price" icon={DollarSign} value={`$${product.basePrice.toFixed(2)}`} />
            )}
            {product.baInfo && (
                 <DetailRow label="Offered By" icon={Package} value={product.baInfo.name} />
            )}
          </section>

          <Separator />

          {product.description && (
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Description</h3>
              <DetailRow label="" icon={FileText} value={
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{product.description}</p>
              } className="grid-cols-[auto_1fr]" />
            </section>
          )}

          {(product.isScheduled && product.scheduledAt && isValid(parseISO(product.scheduledAt))) && (
            <>
              <Separator />
              <section className="space-y-1">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Scheduling</h3>
                <DetailRow label="Scheduled For" icon={Clock} value={format(parseISO(product.scheduledAt), "MMMM d, yyyy 'at' h:mm a")} />
              </section>
            </>
          )}

          <Separator />

          <section className="space-y-1">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Timestamps</h3>
            <DetailRow label="Created At" icon={CalendarDays} value={format(parseISO(product.createdAt), "MMMM d, yyyy, h:mm a")} />
            <DetailRow label="Last Updated" icon={CalendarDays} value={format(parseISO(product.updatedAt), "MMMM d, yyyy, h:mm a")} />
          </section>

          {/* Example for custom attributes if needed
          {product.customAttributes && Object.keys(product.customAttributes).length > 0 && (
            <>
              <Separator />
              <section className="space-y-1">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Additional Details</h3>
                {Object.entries(product.customAttributes).map(([key, value]) => (
                  <DetailRow key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} icon={TagIcon} value={String(value)} />
                ))}
              </section>
            </>
          )}
          */}
        </CardContent>

        <CardFooter className="border-t p-4 sm:p-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
          {isBAView && onEditAction && ( // Show Edit button only for BA view and if onEditAction is provided
            <Button onClick={() => onEditAction(product)} className="w-full sm:w-auto">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Product
            </Button>
          )}
          {showReserveButton && onReserve && ( // Show Reserve button if prop is true and handler exists
             <Button onClick={() => onReserve(product)} className="w-full sm:w-auto">
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.productType === "RESOURCE" ? "Enquire Now" : "Reserve Now"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}