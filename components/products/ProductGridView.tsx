"use client";

import React from "react";
import { ProductListItemData } from "@/lib/types/product";
import { ProductCard } from "./ProductCard"; // Assuming ProductCard is in the same directory
import { ProductRowActionsProps } from "./columns"; // For action handlers consistency
import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
interface ProductGridViewProps extends Omit<ProductRowActionsProps, 'product' | 'isItemActionLoading'> {
  products: ProductListItemData[];
  isLoading: boolean; // For overall loading state of the grid
  error?: string | null;
  fetchProducts?: () => void; // Optional: if grid handles its own refresh trigger
  // actionLoading state needs to be managed by the parent or this component if actions are triggered from here
  getActionLoadingState: (productId: string) => boolean;
}

export function ProductGridView({
  products,
  isLoading,
  error,
  fetchProducts,
  getActionLoadingState,
  ...actionHandlers // Spread remaining action handlers
}: ProductGridViewProps) {

  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="pb-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-1/2 mt-1" /></CardHeader>
            <CardContent className="space-y-2 py-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></CardContent>
            <CardFooter className="pt-3 pb-4 justify-between"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-5 w-1/3" /></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex flex-col justify-center items-center p-10 border border-destructive/50 bg-destructive/10 rounded-lg text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive-foreground font-semibold">{error}</p>
        {fetchProducts && <Button onClick={fetchProducts} variant="destructive" className="mt-6">Try Again</Button>}
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="min-h-[300px] text-center flex flex-col items-center justify-center text-muted-foreground border rounded-lg p-10">
        <Inbox className="h-16 w-16 text-muted-foreground/70 mb-6" />
        <h3 className="text-xl font-semibold">No Products to Display</h3>
        <p className="text-sm mt-1">Your catalog is currently empty or no items match your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 py-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isItemActionLoading={getActionLoadingState(product.id)}
          {...actionHandlers} // Pass down onEdit, onDelete, etc.
        />
      ))}
    </div>
  );
}