// types/product.ts

export interface BusinessActorInfo {
  id: string;
  name: string;
  logoUrl?: string; // Optional logo for the BA
}

export type ProductType = "RESOURCE" | "SERVICE";
export interface ProductListItemData {
  id: string;
  name: string;
  productType: ProductType,
  description?: string;
  basePrice?: number;
  currentState: string; // e.g., PUBLISHED for Service, AVAILABLE for Resource (for customer view)
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isScheduled?: boolean; // Less relevant for customer view of published items
  scheduledAt?: string; // Less relevant for customer view
  imageUrl?: string; // Optional image for the product/service
  baInfo?: BusinessActorInfo; // Information about the BA offering this
  category?: string;
  tags?: string[];
  additionnalInfo?: JSON;
  // additional custom attributes relevant for customer display
  // For example, if it&apos;t a "ConsultationSlot"
  // duration?: string;
  // location?: string;
}

// Potentially a more detailed type if clicking a product shows more info
export interface ProductDetailData extends ProductListItemData {
  // more specific details
  specifications?: Record<string, string | number>;
  availabilityCalendar?: string; // e.g., link or embedded data for service availability
};