"use client";

import { OrganizationForm } from "@/components/organization/organization-form";
import { OrganizationDto } from "@/types/organization";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function CreateOrganizationPage() {
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();
  const { setActiveOrganization, fetchUserOrganizationsList } =
    useActiveOrganization();

  const handleCreateSuccess = async (newOrgData: OrganizationDto) => {
    toast.success(`Organization "${newOrgData.short_name}" created!`);

    // Set the newly created organization as active in our context.
    if (newOrgData.organization_id) {
      await setActiveOrganization(newOrgData.organization_id, newOrgData);
      // We also re-fetch the list to ensure our context is fully up-to-date.
      if (session?.user?.businessActorId) {
        await fetchUserOrganizationsList(session.user.businessActorId);
      } else {
        toast.error(
          "Could not fetch organizations list: missing user session."
        );
      }
      // Now, redirect to the new organization's dashboard.
      router.push(`/business-actor/dashboard`);
    } else {
      // Fallback in case the new org ID is/business-actor/org/dashboard missing.
      toast.error(
        "Could not activate the new organization. Redirecting to dashboard."
      );
      router.push(`/business-actor/dashboard`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Your Organization
        </h1>
        <p className="text-muted-foreground mt-2">
          This is the first step to unlocking your business workspace. Fill out
          the details below.
        </p>
      </div>
      <OrganizationForm onSuccessAction={handleCreateSuccess} mode={"create"} />
    </div>
  );
}
