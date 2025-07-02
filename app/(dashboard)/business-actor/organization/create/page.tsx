"use client";

import { OrganizationForm } from "@/components/organization/organization-form";
import { OrganizationDto } from "@/types/organization";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { useRouter } from "next/navigation";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { setActiveOrganization, fetchUserOrganizationsList } =
    useActiveOrganization();

  const handleCreateSuccess = async (newOrgData: OrganizationDto) => {
    // Refresh the list of organizations in the context
    await fetchUserOrganizationsList();
    // Set the newly created organization as active
    if (newOrgData.organization_id) {
      await setActiveOrganization(newOrgData.organization_id, newOrgData);
      // Redirect to the new organization's profile page
      router.push(`/business-actor/org/profile`);
    } else {
      // Fallback if ID is missing
      router.push(`/business-actor/dashboard`);
    }
  };

  return (
    <div className="space-y-6">
      <OrganizationForm
        mode="create"
        onFormSubmitSuccessAction={handleCreateSuccess}
      />
    </div>
  );
}
