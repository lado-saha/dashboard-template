"use client";

import React from "react";
import Image from "next/image";
import { ProductListItemData } from "@/types/product";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Info, Package, Combine } from "lucide-react"; // Removed UserCircle
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/ui/image-placeholder"; // Import placeholder

interface CustomerProductCardProps {
  product: ProductListItemData;
  onViewDetailsClick: (product: ProductListItemData) => void;
  onReserveClick: (product: ProductListItemData) => void;
}

export function CustomerProductCard({ product, onViewDetailsClick, onReserveClick }: CustomerProductCardProps) {
  const ProductIcon = product.productType === "RESOURCE" ? Package : Combine;
  const baNameInitial = product.baInfo?.name ? product.baInfo.name.charAt(0).toUpperCase() : "B";

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 group">
      <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-lg bg-muted"> {/* Added bg-muted as fallback */}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder iconType={product.productType === 'RESOURCE' ? 'resource' : 'service'} className="h-full w-full rounded-t-lg" iconClassName="h-16 w-16" />
        )}
        <Badge
          variant={product.productType === "RESOURCE" ? "outline" : "secondary"}
          className="absolute top-2.5 right-2.5 capitalize text-xs items-center backdrop-blur-sm bg-background/80 dark:bg-card/80 px-2.5 py-1 shadow"
        >
          <ProductIcon className="mr-1.5 h-3.5 w-3.5 opacity-90" />
          {product.productType.toLowerCase()}
        </Badge>
      </div>

      <CardHeader className="pb-2 pt-4">
        <CardTitle
          className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 hover:text-primary cursor-pointer"
          onClick={() => onViewDetailsClick(product)}
          title={product.name}
        >
          {product.name}
        </CardTitle>
        {product.baInfo && (
          <CardDescription className="text-xs mt-1 flex items-center group-hover:text-foreground/90 transition-colors">
            <Avatar className="h-5 w-5 mr-1.5 border">
              <AvatarImage src={product.baInfo.logoUrl} alt={product.baInfo.name} />
              <AvatarFallback className="text-[9px] bg-secondary text-secondary-foreground">
                {baNameInitial}
              </AvatarFallback>
            </Avatar>
            By <span className="font-medium text-foreground/80 group-hover:text-foreground">{product.baInfo.name}</span>
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-grow space-y-2 text-sm py-2">
        {product.description && (
          <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed min-h-[48px]">
            {product.description}
          </p>
        )}
        <div className="flex items-baseline text-xl font-bold text-primary pt-1">
          {product.basePrice != null ? (
            <>
              <DollarSign className="h-5 w-5 mr-0.5 opacity-90" />
              {product.basePrice.toFixed(2)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {product.productType === 'SERVICE' ? '/session' : '/item'}
              </span>
            </>
          ) : (
            <span className="italic text-base text-muted-foreground">Price on enquiry</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-4 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        <Button variant="outline" size="sm" onClick={() => onViewDetailsClick(product)} className="w-full sm:w-auto flex-1 group/button hover:border-primary/70">
          <Info className="mr-2 h-4 w-4 text-primary/80 group-hover/button:text-primary" /> Details
        </Button>
        <Button size="sm" onClick={() => onReserveClick(product)} className="w-full sm:w-auto flex-1 group/button">
          <ShoppingCart className="mr-2 h-4 w-4" /> Reserve
        </Button>
      </CardFooter>
    </Card>
  );
}