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
import { organizationRepository } from "@/lib/data-repo/organization";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

interface ActiveOrganizationContextType {
  activeOrganizationId: string | null;
  setActiveOrganization: (
    orgId: string | null,
    orgDetails?: OrganizationDto
  ) => Promise<void>;
  activeOrganizationDetails: OrganizationDto | null;
  // This function fetches details for a *specific* org and sets it as active detail
  fetchAndSetActiveOrganizationDetails: (
    id: string
  ) => Promise<OrganizationDto | null>;
  isLoadingOrgDetails: boolean;
  userOrganizations: OrganizationTableRow[];
  // This function fetches the *list* of all orgs for the current user
  fetchUserOrganizationsList: () => Promise<void>;
  isLoadingUserOrgs: boolean;
  clearActiveOrganization: () => void;
  // refreshUserOrganizations was perhaps a misnomer for fetchUserOrganizationsList
}

const ActiveOrganizationContext = createContext<
  ActiveOrganizationContextType | undefined
>(undefined);

// Mock data (should be removed once local JSON files are populated via API routes)
const defaultMockOrgs: OrganizationTableRow[] = [
  {
    organization_id: "org-a1b2c3d4-main",
    short_name: "Innovate Sol.",
    long_name: "Innovate Solutions Global LLC",
    status: "ACTIVE",
    email: "contact@innovate.com",
    logo_url: "/placeholder.svg",
  },
  {
    organization_id: "org-e5f6g7h8-side",
    short_name: "GreenFuture",
    long_name: "GreenTech Future Inc.",
    status: "PENDING_APPROVAL",
    email: "info@greentech.io",
    logo_url: "/placeholder.svg",
  },
];
const defaultMockDetails: Record<string, OrganizationDto> = {
  "org-a1b2c3d4-main": {
    ...defaultMockOrgs[0],
    description: "Main org detail",
    website_url: "https://innovate.com",
    is_active: true,
    legal_form: "31",
  },
  "org-e5f6g7h8-side": {
    ...defaultMockOrgs[1],
    description: "Side org detail",
    website_url: "https://green.io",
    is_active: false,
    legal_form: "32",
  },
};

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

  const fetchAndSetActiveOrganizationDetails = useCallback(
    async (id: string): Promise<OrganizationDto | null> => {
      if (!id) {
        setActiveOrganizationDetailsState(null);
        setActiveOrganizationIdState(null); // Also clear ID if fetching for null/invalid ID
        return null;
      }
      setIsLoadingOrgDetails(true);
      console.log(`CONTEXT: Fetching details for active org: ${id}`);
      try {
        const details = await organizationRepository.getOrganizationById(id);
        setActiveOrganizationDetailsState(details);
        if (details) {
          setActiveOrganizationIdState(id); // Ensure active ID is set if details are found
        } else {
          toast.error(`Organization (ID: ${id}) not found or inaccessible.`);
          setActiveOrganizationIdState(null); // Clear if not found
        }
        return details;
      } catch (error) {
        console.error(
          `CONTEXT: Failed to fetch details for organization ${id}:`,
          error
        );
        toast.error("Could not load organization details.");
        setActiveOrganizationDetailsState(null);
        setActiveOrganizationIdState(null);
        return null;
      } finally {
        setIsLoadingOrgDetails(false);
      }
    },
    []
  );

  const setActiveOrganization = useCallback(
    async (orgId: string | null, orgDetails?: OrganizationDto) => {
      console.log("CONTEXT: setActiveOrganization called with orgId:", orgId);
      if (orgId) {
        setActiveOrganizationIdState(orgId); // Set ID first
        if (orgDetails && orgDetails.organization_id === orgId) {
          // Check if details match orgId
          console.log(
            "CONTEXT: Setting details directly from provided orgDetails"
          );
          setActiveOrganizationDetailsState(orgDetails);
        } else {
          console.log(
            "CONTEXT: orgId provided, fetching details via fetchAndSetActiveOrganizationDetails..."
          );
          await fetchAndSetActiveOrganizationDetails(orgId); // This will also set activeOrganizationIdState
        }
      } else {
        console.log("CONTEXT: orgId is null, clearing details and ID.");
        setActiveOrganizationIdState(null);
        setActiveOrganizationDetailsState(null);
      }
    },
    [fetchAndSetActiveOrganizationDetails]
  ); // fetchAndSetActiveOrganizationDetails is stable

  const fetchUserOrganizationsList = useCallback(async () => {
    if (sessionStatus !== "authenticated") {
      setUserOrganizations([]);
      setIsLoadingUserOrgs(false);
      return;
    }
    setIsLoadingUserOrgs(true);
    try {
      const orgs = await organizationRepository.getMyOrganizations();
      setUserOrganizations(orgs || []);
      console.log("CONTEXT: User organizations fetched:", orgs);
    } catch (error) {
      console.error("CONTEXT: Failed to fetch user organizations:", error);
      toast.error("Could not load your organizations.");
      setUserOrganizations([]);
    } finally {
      setIsLoadingUserOrgs(false);
    }
  }, [sessionStatus]);

  const clearActiveOrganization = useCallback(() => {
    setActiveOrganizationIdState(null);
    setActiveOrganizationDetailsState(null);
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchUserOrganizationsList();
    } else if (sessionStatus === "unauthenticated") {
      setUserOrganizations([]);
      clearActiveOrganization();
      setIsLoadingUserOrgs(false);
    }
  }, [sessionStatus, fetchUserOrganizationsList, clearActiveOrganization]);

  useEffect(() => {
    const pathParts = pathname.split("/");
    const isOrgManagementPath =
      pathParts[1] === "business-actor" &&
      pathParts[2] === "organization" &&
      pathParts[3] &&
      pathParts[3] !== "create";

    if (isOrgManagementPath) {
      const orgIdFromUrl = pathParts[3];
      if (orgIdFromUrl !== activeOrganizationId || !activeOrganizationDetails) {
        // Also fetch if details are missing for current ID
        if (orgIdFromUrl) {
          // Ensure orgIdFromUrl is not undefined
          console.log(
            `CONTEXT: URL sync - Path has orgId ${orgIdFromUrl}. Current activeId: ${activeOrganizationId}. Fetching details.`
          );
          fetchAndSetActiveOrganizationDetails(orgIdFromUrl); // This sets both ID and details
        }
      }
    }
  }, [
    pathname,
    activeOrganizationId,
    activeOrganizationDetails,
    fetchAndSetActiveOrganizationDetails,
  ]);

  return (
    <ActiveOrganizationContext.Provider
      value={{
        activeOrganizationId,
        setActiveOrganization,
        activeOrganizationDetails,
        fetchAndSetActiveOrganizationDetails, // Name in context matches the function name
        isLoadingOrgDetails,
        userOrganizations,
        fetchUserOrganizationsList, // Correctly named function for fetching the list
        isLoadingUserOrgs,
        clearActiveOrganization,
        // refreshUserOrganizations: fetchUserOrganizationsList, // Alias if needed, but direct use is clearer
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
