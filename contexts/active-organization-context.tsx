"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import {
  OrganizationDto,
  OrganizationTableRow,
  AgencyDto,
} from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// Define keys for localStorage to avoid typos
const ORG_ID_STORAGE_KEY = "yowyob_activeOrganizationId";
const AGENCY_ID_STORAGE_KEY = "yowyob_activeAgencyId";

interface ActiveOrganizationContextType {
  activeOrganizationId: string | null;
  activeOrganizationDetails: OrganizationDto | null;
  isLoadingOrgDetails: boolean;
  userOrganizations: OrganizationTableRow[];
  isLoadingUserOrgs: boolean;
  isOrgContextInitialized: boolean;
  setActiveOrganization: (
    orgId: string | null,
    orgDetails?: OrganizationDto
  ) => Promise<void>;
  fetchAndSetOrganizationDetails: (
    id: string
  ) => Promise<OrganizationDto | null>;
  fetchUserOrganizationsList: () => Promise<void>;
  activeAgencyId: string | null;
  activeAgencyDetails: AgencyDto | null;
  isLoadingAgencyDetails: boolean;
  setActiveAgency: (
    agencyId: string | null,
    agencyDetails?: AgencyDto
  ) => Promise<void>;
  agenciesForCurrentOrg: AgencyDto[];
  isLoadingAgencies: boolean;
  fetchAgenciesForCurrentOrg: () => Promise<void>;
  clearActiveAgency: () => void;
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

  // --- State Initialization with localStorage ---
  // On initial load, try to "rehydrate" the active IDs from localStorage.
  // The function passed to useState runs only once, preventing issues with server-rendering.
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<
    string | null
  >(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ORG_ID_STORAGE_KEY) || null;
  });

  const [activeAgencyId, setActiveAgencyIdState] = useState<string | null>(
    () => {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(AGENCY_ID_STORAGE_KEY) || null;
    }
  );

  // Other state variables remain the same
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
  const [activeAgencyDetails, setActiveAgencyDetailsState] =
    useState<AgencyDto | null>(null);
  const [isLoadingAgencyDetails, setIsLoadingAgencyDetails] = useState(false);
  const [agenciesForCurrentOrg, setAgenciesForCurrentOrg] = useState<
    AgencyDto[]
  >([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(true);

  // --- Core Functions with localStorage Persistence ---

  const clearActiveAgency = useCallback(() => {
    setActiveAgencyIdState(null);
    setActiveAgencyDetailsState(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AGENCY_ID_STORAGE_KEY);
    }
  }, []);

  const internalFetchAndSetOrgDetails = useCallback(
    async (id: string): Promise<OrganizationDto | null> => {
      // This function implicitly validates the stored ID. If the API fails
      // (e.g., user no longer has access), the context will be cleared.
      setIsLoadingOrgDetails(true);
      try {
        const details = await organizationRepository.getOrganizationById(id);
        setActiveOrganizationDetailsState(details);
        return details;
      } catch (error) {
        toast.error("Could not load organization. It may have been removed.");
        // If stored ID is invalid, clear it from state and localStorage
        setActiveOrganizationIdState(null);
        if (typeof window !== 'undefined') window.localStorage.removeItem(ORG_ID_STORAGE_KEY);
        clearActiveAgency();
        return null;
      } finally {
        setIsLoadingOrgDetails(false);
      }
    },
    [clearActiveAgency]
  );

  const setActiveOrganization = useCallback(
    async (orgId: string | null, orgDetails?: OrganizationDto) => {
      clearActiveAgency(); // Switching orgs always clears the agency
      setActiveOrganizationIdState(orgId);

      if (typeof window !== "undefined") {
        if (orgId) {
          window.localStorage.setItem(ORG_ID_STORAGE_KEY, orgId);
        } else {
          window.localStorage.removeItem(ORG_ID_STORAGE_KEY);
        }
      }

      if (orgDetails && orgId === orgDetails.organization_id) {
        setActiveOrganizationDetailsState(orgDetails);
      } else if (orgId) {
        await internalFetchAndSetOrgDetails(orgId);
      } else {
        setActiveOrganizationDetailsState(null);
      }
    },
    [internalFetchAndSetOrgDetails, clearActiveAgency]
  );

  const fetchAndSetAgencyDetails = useCallback(
    async (agencyId: string) => {
      if (!activeOrganizationId) return;
      setIsLoadingAgencyDetails(true);
      try {
        const details = await organizationRepository.getAgencyById(activeOrganizationId, agencyId);
        setActiveAgencyDetailsState(details);
        if (!details) {
          toast.error(`Could not load details for the selected agency.`);
          setActiveAgencyIdState(null);
          if (typeof window !== 'undefined') window.localStorage.removeItem(AGENCY_ID_STORAGE_KEY);
        }
      } catch (error) {
        toast.error("Failed to fetch agency details.");
        setActiveAgencyIdState(null);
        if (typeof window !== 'undefined') window.localStorage.removeItem(AGENCY_ID_STORAGE_KEY);
      } finally {
        setIsLoadingAgencyDetails(false);
      }
    },
    [activeOrganizationId]
  );

  const setActiveAgency = useCallback(
    async (agencyId: string | null, agencyDetails?: AgencyDto) => {
      setActiveAgencyIdState(agencyId);

      if (typeof window !== "undefined") {
        if (agencyId) {
          window.localStorage.setItem(AGENCY_ID_STORAGE_KEY, agencyId);
        } else {
          window.localStorage.removeItem(AGENCY_ID_STORAGE_KEY);
        }
      }

      if (agencyDetails && agencyId === agencyDetails.agency_id) {
        setActiveAgencyDetailsState(agencyDetails);
      } else if (agencyId) {
        await fetchAndSetAgencyDetails(agencyId);
      } else {
        setActiveAgencyDetailsState(null);
      }
    },
    [fetchAndSetAgencyDetails]
  );

  const fetchUserOrganizationsList = useCallback(async () => {
    // ... function unchanged
  }, [sessionStatus]);

  // --- Effects to Fetch Data on Load ---

  useEffect(() => {
    // When the context first loads, if there's a stored org ID, fetch its details.
    if (activeOrganizationId && !activeOrganizationDetails) {
      internalFetchAndSetOrgDetails(activeOrganizationId);
    }
    // If there's a stored agency ID, fetch its details.
    if (activeAgencyId && !activeAgencyDetails) {
      fetchAndSetAgencyDetails(activeAgencyId);
    }
  }, [activeOrganizationId, activeAgencyId, activeOrganizationDetails, activeAgencyDetails, internalFetchAndSetOrgDetails, fetchAndSetAgencyDetails]);

  const fetchAgenciesForCurrentOrg = useCallback(async () => {
    // ... function unchanged
  }, [activeOrganizationId]);

  useEffect(() => {
    if (activeOrganizationId) {
      fetchAgenciesForCurrentOrg();
    } else {
      setAgenciesForCurrentOrg([]);
    }
  }, [activeOrganizationId, fetchAgenciesForCurrentOrg]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && !isOrgContextInitialized) {
      fetchUserOrganizationsList();
    } else if (sessionStatus === "unauthenticated") {
      // On logout, clear everything including localStorage
      setActiveOrganizationIdState(null);
      setActiveOrganizationDetailsState(null);
      clearActiveAgency();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(ORG_ID_STORAGE_KEY);
      }
      setUserOrganizations([]);
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(false);
    }
  }, [sessionStatus, fetchUserOrganizationsList, clearActiveAgency, isOrgContextInitialized]);


  return (
    <ActiveOrganizationContext.Provider value={{ activeOrganizationId, setActiveOrganization, activeOrganizationDetails, fetchAndSetOrganizationDetails: internalFetchAndSetOrgDetails, isLoadingOrgDetails, userOrganizations, fetchUserOrganizationsList, isLoadingUserOrgs, isOrgContextInitialized, activeAgencyId, activeAgencyDetails, isLoadingAgencyDetails, setActiveAgency, clearActiveAgency, agenciesForCurrentOrg, isLoadingAgencies, fetchAgenciesForCurrentOrg }}>
      {children}
    </ActiveOrganizationContext.Provider>
  );
};

export const useActiveOrganization = (): ActiveOrganizationContextType => {
  const context = useContext(ActiveOrganizationContext);
  if (context === undefined) {
    throw new Error("useActiveOrganization must be used within an ActiveOrganizationProvider");
  }
  return context;
};