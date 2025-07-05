"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CardContent } from "@/components/ui/card";
import { OrganizationLegalForm as OrgLegalFormEnum } from "@/types/organization";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

const legalFormOptions: { value: OrgLegalFormEnum; label: string }[] = [
  { value: "11", label: "Sole Proprietorship" },
  { value: "31", label: "Private Limited Company (Ltd)" },
  { value: "32", label: "Public Limited Company (PLC)" },
  { value: "51", label: "Cooperative" },
];

export function OrgLegalForm({ form }: { form: any }) {
  return (
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        name="legal_form"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Legal Form *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {legalFormOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="business_registration_number"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Registration No.</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="tax_number"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tax ID / VAT Number</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="capital_share"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Capital Share (USD)</FormLabel>
            <FormControl>
              <Input type="number" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="registration_date"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Registration Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "h-10 w-full justify-start font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="year_founded"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Year Founded</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "h-10 w-full justify-start font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "yyyy")
                    ) : (
                      <span>Pick year</span>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  );
}
