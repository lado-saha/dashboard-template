"use client";

import React from "react";
import { CustomerDto } from "@/types/organization";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  DollarSign,
  CreditCard,
} from "lucide-react";

interface CustomerCardProps {
  customer: CustomerDto;
  onEditAction: (customer: CustomerDto) => void;
  onDeleteAction: (customer: CustomerDto) => void;
}

export function CustomerCard({
  customer,
  onEditAction,
  onDeleteAction,
}: CustomerCardProps) {
  const fullName = `${customer.first_name || ""} ${
    customer.last_name || ""
  }`.trim();
  const fallback = fullName ? fullName.charAt(0).toUpperCase() : "C";

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={customer.logo} alt={fullName} />
            <AvatarFallback className="text-lg">{fallback}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-semibold line-clamp-1">
              {fullName}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {customer.short_description || "Customer"}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditAction(customer)}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteAction(customer)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Last Payment: {customer.payment_method || "N/A"}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <DollarSign className="mr-2 h-4 w-4" />
          <span>Last Amount: {customer.amount_paid || "N/A"}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onEditAction(customer)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
