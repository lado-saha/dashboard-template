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
  // This is the function to fetch and set details for a *specific* org ID
  fetchAndSetOrganizationDetails: (
    id: string
  ) => Promise<OrganizationDto | null>; // Renamed for clarity from previous versions
  isLoadingOrgDetails: boolean;
  userOrganizations: OrganizationTableRow[];
  // This function fetches the *list* of all orgs for the current user
  fetchUserOrganizationsList: () => Promise<void>;
  isLoadingUserOrgs: boolean;
  clearActiveOrganization: () => void;
  isOrgContextInitialized: boolean;
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
  const [isOrgContextInitialized, setIsOrgContextInitialized] =
    useState<boolean>(false);

  // Renamed internal function to avoid confusion with the one exposed in context
  const internalFetchAndSetOrgDetails = useCallback(
    async (id: string): Promise<OrganizationDto | null> => {
      if (!id) {
        setActiveOrganizationDetailsState(null);
        // Do not clear activeOrganizationIdState here if we want to preserve it while details are null
        return null;
      }
      setIsLoadingOrgDetails(true);
      console.log(`CONTEXT: Fetching details for active org: ${id}`);
      try {
        const details = await organizationRepository.getOrganizationById(id);
        setActiveOrganizationDetailsState(details); // Can be null if not found
        if (details) {
          setActiveOrganizationIdState(id); // If details found, confirm this ID is active
        } else {
          toast.error(`Organization (ID: ${id}) not found or inaccessible.`);
          // If details are not found for an ID that was attempted to be set active, clear it.
          if (activeOrganizationId === id) {
            setActiveOrganizationIdState(null);
          }
        }
        return details;
      } catch (error) {
        console.error(`CONTEXT: Failed to fetch details for org ${id}:`, error);
        toast.error("Could not load organization details.");
        setActiveOrganizationDetailsState(null);
        if (activeOrganizationId === id) {
          // Only clear active ID if it was the one failing
          setActiveOrganizationIdState(null);
        }
        return null;
      } finally {
        setIsLoadingOrgDetails(false);
      }
    },
    [activeOrganizationId]
  ); // Added activeOrganizationId to dependencies

  const setActiveOrganization = useCallback(
    async (orgId: string | null, orgDetails?: OrganizationDto) => {
      setActiveOrganizationIdState(orgId); // Set the ID immediately
      if (orgDetails && orgId === orgDetails.organization_id) {
        setActiveOrganizationDetailsState(orgDetails);
      } else if (orgId) {
        await internalFetchAndSetOrgDetails(orgId); // This will also set details
      } else {
        setActiveOrganizationDetailsState(null); // Clear details if orgId is null
      }
    },
    [internalFetchAndSetOrgDetails]
  );

  const fetchUserOrganizationsList = useCallback(async () => {
    if (sessionStatus !== "authenticated") {
      setUserOrganizations([]);
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
      return;
    }
    setIsLoadingUserOrgs(true);
    try {
      const orgs = await organizationRepository.getMyOrganizations();
      setUserOrganizations(orgs || []);
    } catch (error) {
      console.error("CONTEXT: Failed to fetch user organizations:", error);
      toast.error("Could not load your organizations.");
      setUserOrganizations([]);
    } finally {
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
    }
  }, [sessionStatus]);

  const clearActiveOrganization = useCallback(() => {
    setActiveOrganizationIdState(null);
    setActiveOrganizationDetailsState(null);
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated" && !isOrgContextInitialized) {
      fetchUserOrganizationsList();
    } else if (sessionStatus === "unauthenticated") {
      setUserOrganizations([]);
      clearActiveOrganization();
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(false);
    }
  }, [
    sessionStatus,
    fetchUserOrganizationsList,
    clearActiveOrganization,
    isOrgContextInitialized,
  ]);

  useEffect(() => {
    if (!isOrgContextInitialized || !session?.user?.id) return;

    const pathParts = pathname.split("/");
    const isOrgSpecificPath =
      pathParts[1] === "business-actor" &&
      pathParts[2] === "organization" &&
      pathParts[3] &&
      pathParts[3] !== "create";

    if (isOrgSpecificPath) {
      const orgIdFromUrl = pathParts[3];
      if (
        orgIdFromUrl !== activeOrganizationId ||
        (orgIdFromUrl && !activeOrganizationDetails)
      ) {
        // If user has orgs, check if URL orgId is valid before fetching
        if (
          userOrganizations.length > 0 &&
          !userOrganizations.find((o) => o.organization_id === orgIdFromUrl)
        ) {
          toast.error("Invalid organization in URL or no access.");
          router.replace("/business-actor/dashboard");
          clearActiveOrganization();
        } else if (userOrganizations.length === 0 && !isLoadingUserOrgs) {
          // User has no orgs loaded, but URL suggests one - likely invalid state or direct nav to bad URL
          toast.error("No organizations found for your account.");
          router.replace("/business-actor/dashboard");
          clearActiveOrganization();
        } else {
          internalFetchAndSetOrgDetails(orgIdFromUrl);
        }
      }
    }
  }, [
    pathname,
    activeOrganizationId,
    activeOrganizationDetails,
    internalFetchAndSetOrgDetails,
    isOrgContextInitialized,
    userOrganizations,
    isLoadingUserOrgs,
    router,
    session?.user?.id,
    clearActiveOrganization,
  ]);

  return (
    <ActiveOrganizationContext.Provider
      value={{
        activeOrganizationId,
        setActiveOrganization,
        activeOrganizationDetails,
        fetchAndSetOrganizationDetails: internalFetchAndSetOrgDetails, // Ensure this matches the interface
        isLoadingOrgDetails,
        userOrganizations,
        fetchUserOrganizationsList,
        isLoadingUserOrgs,
        clearActiveOrganization,
        isOrgContextInitialized,
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
