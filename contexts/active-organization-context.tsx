"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { OrganizationDto, OrganizationTableRow } from "@/types/organization";
import { organizationApi } from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import {
  mockUserOrganizations as defaultMockOrgs,
  mockOrganizationDetails as defaultMockDetails,
} from "@/lib/mock-data/organization-mocks";

interface ActiveOrganizationContextType {
  activeOrganizationId: string | null;
  setActiveOrganization: (
    orgId: string | null,
    orgDetails?: OrganizationDto
  ) => void;
  activeOrganizationDetails: OrganizationDto | null;
  fetchActiveOrganizationDetails: (
    id: string
  ) => Promise<OrganizationDto | null>;
  isLoadingOrgDetails: boolean;
  userOrganizations: OrganizationTableRow[];
  // fetchUserOrganizations is now internal to the provider, refreshUserOrganizations is exposed
  isLoadingUserOrgs: boolean;
  clearActiveOrganization: () => void;
  refreshUserOrganizations: () => Promise<void>;
}

const ActiveOrganizationContext = createContext<
  ActiveOrganizationContextType | undefined
>(undefined);

export const ActiveOrganizationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [activeOrganizationId, setActiveOrganizationIdState] = useState<
    string | null
  >(null);
  const [activeOrganizationDetails, setActiveOrganizationDetailsState] =
    useState<OrganizationDto | null>(null);
  const [isLoadingOrgDetails, setIsLoadingOrgDetails] =
    useState<boolean>(false);

  const [userOrganizations, setUserOrganizations] = useState<
    OrganizationTableRow[]
  >([]);
  const [isLoadingUserOrgs, setIsLoadingUserOrgs] = useState<boolean>(true);

  const fetchActiveOrganizationDetailsInternal = useCallback(
    async (id: string): Promise<OrganizationDto | null> => {
      if (!id) {
        setActiveOrganizationDetailsState(null);
        return null;
      }
      setIsLoadingOrgDetails(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const orgDetailMock = defaultMockDetails[id];
        if (orgDetailMock) {
          setActiveOrganizationDetailsState(orgDetailMock);
          return orgDetailMock;
        } else {
          const foundOrg =
            userOrganizations.find((org) => org.organization_id === id) ||
            defaultMockOrgs.find((org) => org.organization_id === id);
          if (foundOrg) {
            const mockDetailsFallback: OrganizationDto = {
              ...foundOrg,
              description:
                foundOrg.description || `Details for ${foundOrg.long_name}.`,
              is_individual_business: foundOrg.is_individual_business ?? false,
              legal_form: foundOrg.legal_form || "21",
              is_active: foundOrg.status === "ACTIVE",
              website_url:
                foundOrg.website_url ||
                `https://www.${foundOrg.short_name
                  ?.toLowerCase()
                  .replace(/\s+/g, "")}.com`,
            };
            setActiveOrganizationDetailsState(mockDetailsFallback);
            return mockDetailsFallback;
          }
          throw new Error("Organization details not found in mock data.");
        }
      } catch (error) {
        console.error(`Failed to fetch details for organization ${id}:`, error);
        toast.error("Could not load organization details.");
        setActiveOrganizationDetailsState(null);
        return null;
      } finally {
        setIsLoadingOrgDetails(false);
      }
    },
    [userOrganizations]
  ); // userOrganizations dependency is fine here

  const setActiveOrganization = useCallback(
    (orgId: string | null, orgDetails?: OrganizationDto) => {
      console.log("setActiveOrganization called with:", orgId);
      setActiveOrganizationIdState(orgId);
      if (orgDetails) {
        setActiveOrganizationDetailsState(orgDetails);
      } else if (orgId) {
        fetchActiveOrganizationDetailsInternal(orgId); // Call internal version
      } else {
        setActiveOrganizationDetailsState(null);
      }
    },
    [fetchActiveOrganizationDetailsInternal]
  ); // Depends on the stable internal fetcher

  const fetchUserOrganizationsInternal = useCallback(async () => {
    // if (sessionStatus !== "authenticated") {
    //   setUserOrganizations([]);
    //   setIsLoadingUserOrgs(false);
    //   return;
    // }
    console.log("Fetching user organizations...");
    setIsLoadingUserOrgs(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setUserOrganizations(defaultMockOrgs);
      console.log("Mock organizations set:", defaultMockOrgs);
    } catch (error) {
      console.error("Failed to fetch user organizations:", error);
      toast.error("Could not load your organizations.");
      setUserOrganizations([]);
    } finally {
      setIsLoadingUserOrgs(false);
    }
    // Primary dependency is sessionStatus. This function should not set the active org.
  }, [sessionStatus]);

  const clearActiveOrganization = useCallback(() => {
    setActiveOrganizationIdState(null);
    setActiveOrganizationDetailsState(null);
  }, []);

  const refreshUserOrganizations = useCallback(async () => {
    await fetchUserOrganizationsInternal();
  }, [fetchUserOrganizationsInternal]);

  // Effect to fetch organizations when user session becomes available
  useEffect(() => {
    // if (sessionStatus === "authenticated") {
    fetchUserOrganizationsInternal();
    // } else if (sessionStatus === "unauthenticated") {
    //   setUserOrganizations([]);
    //   clearActiveOrganization();
    //   setIsLoadingUserOrgs(false);
    // }
  }, [sessionStatus, fetchUserOrganizationsInternal, clearActiveOrganization]);

  // Effect to sync active organization with URL changes
  // This effect runs *after* userOrganizations might be populated.
  useEffect(() => {
    const pathParts = pathname.split("/");
    if (
      pathParts[1] === "business-actor" &&
      pathParts[2] === "organization" &&
      pathParts[3] &&
      pathParts[3] !== "create"
    ) {
      const orgIdFromUrl = pathParts[3];
      if (orgIdFromUrl !== activeOrganizationId) {
        // Only update if different
        console.log(
          `URL orgId (${orgIdFromUrl}) processing. Current activeId: ${activeOrganizationId}`
        );
        // We call setActiveOrganization which internally calls fetchActiveOrganizationDetailsInternal
        setActiveOrganization(orgIdFromUrl);
      }
    }
    // This effect should run when pathname changes, or when userOrganizations are loaded (to ensure we can validate orgIdFromUrl if needed)
    // or when setActiveOrganization function reference changes (though it should be stable due to useCallback)
  }, [pathname, setActiveOrganization, activeOrganizationId]); // Removed userOrganizations to avoid potential loop if it's frequently re-created

  // Effect to potentially set a default active organization AFTER userOrganizations are loaded
  // and if no activeOrganizationId is set by URL or other means.
  useEffect(() => {
    if (
      !isLoadingUserOrgs &&
      userOrganizations.length > 0 &&
      !activeOrganizationId
    ) {
      // Check if current path is the main BA dashboard, not an org-specific page
      if (pathname === "/business-actor/dashboard") {
        console.log(
          "No active org, and on BA dashboard. Setting first org as active by default."
        );
        // Uncomment this if you want to auto-select and navigate
        // const firstOrg = userOrganizations[0];
        // if (firstOrg && firstOrg.organization_id) {
        //   setActiveOrganization(firstOrg.organization_id, firstOrg as OrganizationDto);
        //   router.replace(`/business-actor/organization/${firstOrg.organization_id}/profile`);
        // }
      }
    }
  }, [
    isLoadingUserOrgs,
    userOrganizations,
    activeOrganizationId,
    setActiveOrganization,
    router,
    pathname,
  ]);

  return (
    <ActiveOrganizationContext.Provider
      value={{
        activeOrganizationId,
        setActiveOrganization,
        activeOrganizationDetails,
        fetchActiveOrganizationDetails: fetchActiveOrganizationDetailsInternal, // Expose the internal fetcher
        isLoadingOrgDetails,
        userOrganizations,
        // fetchUserOrganizations: fetchUserOrganizationsInternal, // No longer directly exposing this variant
        isLoadingUserOrgs,
        clearActiveOrganization,
        refreshUserOrganizations,
      }}
    >
      {children}
    </ActiveOrganizationContext.Provider>
  );
};

export const useActiveOrganization = (): ActiveOrganizationContextType => {
  const context = useContext(ActiveOrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useActiveOrganization must be used within an ActiveOrganizationProvider"
    );
  }
  return context;
};
