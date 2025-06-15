"use client";

import React from "react";
import { OrganizationDto } from "@/lib/types/organization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid } from "date-fns";
import {
  Mail,
  Globe,
  Briefcase,
  Building2,
  Hash,
  DollarSign,
  Users,
  CalendarDays,
  Info,
  ChevronsRight,
  FileText,
  Tag,
} from "lucide-react";
import Image from "next/image";

interface OrganizationDetailViewProps {
  organization: OrganizationDto | null;
}

const DetailItem: React.FC<{
  label: string;
  value?: string | number | null;
  icon?: React.ElementType;
  className?: string;
}> = ({ label, value, icon: Icon, className }) => {
  if (!value && value !== 0) return null; // Don't render if value is null or undefined (except 0)
  return (
    <div className={`flex items-start text-sm ${className}`}>
      {Icon && (
        <Icon className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
      )}
      <span className="font-medium text-muted-foreground min-w-[160px]">
        {label}:
      </span>
      <span className="text-foreground ml-1 break-words">{String(value)}</span>
    </div>
  );
};

export function OrganizationDetailView({
  organization,
}: OrganizationDetailViewProps) {
  if (!organization) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No organization details to display.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {organization.logo_url &&
          organization.logo_url !== "/placeholder.svg" ? (
            <Image
              src={organization.logo_url}
              alt={`${organization.short_name} logo`}
              width={64}
              height={64}
              className="rounded-md border object-contain h-16 w-16"
            />
          ) : (
            <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center border">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <CardTitle className="text-xl sm:text-2xl">
              {organization.long_name}
            </CardTitle>
            <CardDescription>
              {organization.short_name} - {organization.email}
            </CardDescription>
          </div>
          {organization.status && (
            <Badge
              variant={
                organization.status === "ACTIVE" ? "default" : "secondary"
              }
              className="ml-auto capitalize text-xs sm:text-sm px-3 py-1 self-start sm:self-center"
            >
              {organization.status.toLowerCase().replace("_", " ")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-primary mb-1">
            Core Details
          </h4>
          <DetailItem
            label="Official Name"
            value={organization.long_name}
            icon={Building2}
          />
          <DetailItem label="Short Name" value={organization.short_name} />
          <DetailItem
            label="Description"
            value={organization.description}
            icon={Info}
          />
          <DetailItem
            label="Contact Email"
            value={organization.email}
            icon={Mail}
          />
          <DetailItem
            label="Website"
            value={organization.website_url}
            icon={Globe}
          />
          <DetailItem
            label="Social Network"
            value={organization.social_network}
            icon={Users}
          />
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-primary mb-1">
            Legal & Financial
          </h4>
          <DetailItem
            label="Legal Form"
            value={organization.legal_form}
            icon={FileText}
          />
          <DetailItem
            label="Business Reg. No."
            value={organization.business_registration_number}
            icon={Hash}
          />
          <DetailItem
            label="Tax Number"
            value={organization.tax_number}
            icon={Hash}
          />
          <DetailItem
            label="Capital Share"
            value={
              organization.capital_share
                ? `$${organization.capital_share.toLocaleString()}`
                : null
            }
            icon={DollarSign}
          />
          <DetailItem
            label="Registration Date"
            value={
              organization.registration_date &&
              isValid(parseISO(organization.registration_date))
                ? format(parseISO(organization.registration_date), "PPP")
                : null
            }
            icon={CalendarDays}
          />
          <DetailItem
            label="Year Founded"
            value={
              organization.year_founded &&
              isValid(parseISO(organization.year_founded))
                ? format(parseISO(organization.year_founded), "yyyy")
                : null
            }
            icon={CalendarDays}
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <h4 className="font-semibold text-sm text-primary mb-1">
            Operational
          </h4>
          <DetailItem
            label="CEO Name"
            value={organization.ceo_name}
            icon={Users}
          />
          <DetailItem
            label="No. of Employees"
            value={(organization as any).number_of_employees}
            icon={Users}
          />
          {organization.keywords && organization.keywords.length > 0 && (
            <div className="flex items-start text-sm">
              <Tag className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-muted-foreground min-w-[160px]">
                Keywords:
              </span>
              <span className="ml-1 flex flex-wrap gap-1">
                {organization.keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="font-normal">
                    {kw}
                  </Badge>
                ))}
              </span>
            </div>
          )}
          {/* Business Domains would be listed here, fetched separately perhaps */}
          {/* {organization.business_domains && organization.business_domains.length > 0 && (
                 <DetailItem label="Business Domains" value={organization.business_domains.join(', ')} icon={Briefcase} />
            )} */}
        </div>
      </CardContent>
    </Card>
  );
}
