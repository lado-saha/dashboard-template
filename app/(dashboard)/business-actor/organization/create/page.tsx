"use client";

import React from "react";
import { OrganizationForm } from "@/components/organization/organization-form";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { OrganizationDto } from "@/types/organization"; // For the callback
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateOrganizationPage() {
  const { setActiveOrganization, refreshUserOrganizations } =
    useActiveOrganization();
  const router = useRouter();

  const handleCreateSuccess = async (createdOrg: OrganizationDto) => {
    if (createdOrg.organization_id) {
      await refreshUserOrganizations(); // Refresh the list of orgs in context
      setActiveOrganization(createdOrg.organization_id, createdOrg);
      router.push(
        `/business-actor/organization/${createdOrg.organization_id}/profile`
      );
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/business-actor/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <OrganizationForm
        mode="create"
        onFormSubmitSuccess={handleCreateSuccess}
      />
    </div>
  );
}
