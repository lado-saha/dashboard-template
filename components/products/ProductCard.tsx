"use client";

import React from "react";
import { ProductListItemData } from "@/lib/types/product";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Eye, RefreshCw, Package, Combine, Clock, InfoIcon, CircleDot, CheckCircle2, CircleSlash, PlayCircle, XCircle, Loader2, DollarSign } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";

// Re-use or import these helpers if they are in a shared location
interface StateDisplayInfo {
  variant: "default" | "secondary" | "outline" | "destructive";
  icon: React.ElementType;
  label: string;
}
const getStateDisplayInfo = (state: string = ""): StateDisplayInfo => {
    const upperState = state.toUpperCase();
    const label = upperState.toLowerCase().replace(/_/g, " ");
    switch (upperState) {
      case "FREE": case "AVAILABLE": return { variant: "default", icon: CheckCircle2, label };
      case "PUBLISHED": case "FINISHED": return { variant: "default", icon: CheckCircle2, label };
      case "AFFECTED": case "PLANNED": return { variant: "secondary", icon: Clock, label };
      case "IN_USE": case "ONGOING": return { variant: "outline", icon: CircleDot, label };
      case "CANCELLED": case "DELETED": return { variant: "destructive", icon: CircleSlash, label };
      default: return { variant: "outline", icon: InfoIcon, label: label || "Unknown" };
    }
};

const getStateChangeIcon = (nextState: string) => {
    switch (nextState.toUpperCase()) {
        case "PUBLISHED": case "ONGOING": case "AFFECTED": case "IN_USE": return PlayCircle;
        case "FINISHED": return CheckCircle2;
        case "CANCELLED": case "FREE": return XCircle;
        default: return RefreshCw;
    }
};

// Props for ProductCard, similar to ProductRowActionsProps but for a single card
interface ProductCardActionsProps {
  onEdit: (product: ProductListItemData) => void;
  onDelete: (product: ProductListItemData) => void;
  onChangeState: (product: ProductListItemData, newState: string) => void;
  onViewDetails: (product: ProductListItemData) => void;
  resourceStateTransitions: Record<string, string[]>;
  serviceStateTransitions: Record<string, string[]>;
  isItemActionLoading?: boolean; // Optional for card context
}

interface ProductCardProps extends ProductCardActionsProps {
  product: ProductListItemData;
}

export function ProductCard({ product, onEdit, onDelete, onChangeState, onViewDetails, resourceStateTransitions, serviceStateTransitions, isItemActionLoading }: ProductCardProps) {
  const stateInfo = getStateDisplayInfo(product.currentState);
  const ProductIcon = product.productType === "RESOURCE" ? Package : Combine;

  const getAvailableTransitions = (prod: ProductListItemData) => {
    if (prod.productType === "RESOURCE") return resourceStateTransitions[prod.currentState.toUpperCase()] || [];
    if (prod.productType === "SERVICE") return serviceStateTransitions[prod.currentState.toUpperCase()] || [];
    return [];
  };
  const availableTransitions = getAvailableTransitions(product);

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 hover:text-primary cursor-pointer" onClick={() => onViewDetails(product)}>
            {product.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" disabled={isItemActionLoading}>
                {isItemActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                <span className="sr-only">Product actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[190px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(product)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(product)}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              {availableTransitions.length > 0 && <DropdownMenuSeparator />}
              {availableTransitions.map(nextState => {
                  const Icon = getStateChangeIcon(nextState);
                  return ( <DropdownMenuItem key={nextState} onClick={() => onChangeState(product, nextState)}> <Icon className="mr-2 h-4 w-4" /> Change to {nextState.toLowerCase().replace(/_/g, " ")} </DropdownMenuItem> );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(product)} className="text-destructive focus:text-destructive focus:bg-destructive/10"> <Trash2 className="mr-2 h-4 w-4" /> Delete </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-xs flex items-center mt-1">
            <ProductIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            {product.productType.toLowerCase()}
            <span className="mx-1.5">·</span>
            ID: {product.id.substring(0, 8)}...
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm py-3">
        <div className="flex items-center">
            <Badge variant={stateInfo.variant} className="capitalize text-xs items-center px-2 py-0.5">
                <stateInfo.icon className="mr-1.5 h-3.5 w-3.5" />
                {stateInfo.label}
            </Badge>
        </div>
        {product.description && (
          <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
            {product.description}
          </p>
        )}
         {product.isScheduled && product.scheduledAt && isValid(parseISO(product.scheduledAt)) && (
            <div className="text-xs text-sky-600 dark:text-sky-400 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0"/>
                Scheduled: {format(parseISO(product.scheduledAt), "PPp")}
            </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 pb-4 text-xs justify-between items-center">
        <div className="text-muted-foreground">
            {product.basePrice != null ? (
                <span className="font-medium text-foreground flex items-center"><DollarSign className="h-3.5 w-3.5 mr-1 text-green-600"/>${product.basePrice.toFixed(2)}</span>
            ) : (
                <span className="italic">No price set</span>
            )}
        </div>
        <div className="text-muted-foreground" title={format(parseISO(product.updatedAt), "MMMM d, yyyy 'at' h:mm a")}>
            Updated: {format(parseISO(product.updatedAt), "PP")}
        </div>
      </CardFooter>
    </Card>
  );
}