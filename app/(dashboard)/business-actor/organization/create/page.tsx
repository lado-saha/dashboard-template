"use client";

import { OrganizationForm } from "@/components/organization/organization-form";
import { OrganizationDto } from "@/types/organization";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/ui/page-header";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const { setActiveOrganization, fetchUserOrganizationsList } =
    useActiveOrganization();

  const handleCreateSuccess = async (newOrgData: OrganizationDto) => {
    toast.success(`Organization "${newOrgData.short_name}" created!`);

    if (newOrgData.organization_id) {
      await updateSession({ businessActorId: session?.user.id });

      await setActiveOrganization(newOrgData.organization_id, newOrgData);
      await fetchUserOrganizationsList();

      // Redirect to the new organization's dashboard.
      router.push(`/business-actor/dashboard`);
    } else {
      toast.error("Could not activate the new organization. Please try again.");
      router.push(`/dashboard`);
    }
  };

  return (
    <div className="">
      <OrganizationForm onSuccessAction={handleCreateSuccess} mode={"create"} />
    </div>
  );
}
