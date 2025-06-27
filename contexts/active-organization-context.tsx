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
import { useRouter, usePathname } from "next/navigation";

interface ActiveOrganizationContextType {
  // Organization State
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

  // Agency State & Actions
  activeAgencyId: string | null;
  activeAgencyDetails: AgencyDto | null;
  isLoadingAgencyDetails: boolean;
  setActiveAgency: (
    agencyId: string | null,
    agencyDetails?: AgencyDto
  ) => Promise<void>;
  agenciesForCurrentOrg: AgencyDto[]; // <-- ADDED
  isLoadingAgencies: boolean; // <-- ADDED
  fetchAgenciesForCurrentOrg: () => Promise<void>; // <-- ADDED
  clearActiveAgency: () => void; // <-- RENAMED for clarity
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

  // Organization State
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

  // Agency State
  const [activeAgencyId, setActiveAgencyIdState] = useState<string | null>(
    null
  );
  const [activeAgencyDetails, setActiveAgencyDetailsState] =
    useState<AgencyDto | null>(null);
  const [isLoadingAgencyDetails, setIsLoadingAgencyDetails] = useState(false);
  const [agenciesForCurrentOrg, setAgenciesForCurrentOrg] = useState<
    AgencyDto[]
  >([]); // <-- ADDED state
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(true); // <-- ADDED state

  const internalFetchAndSetOrgDetails = useCallback(
    async (id: string): Promise<OrganizationDto | null> => {
      if (!id) {
        setActiveOrganizationDetailsState(null);
        return null;
      }
      setIsLoadingOrgDetails(true);
      try {
        const details = await organizationRepository.getOrganizationById(id);
        setActiveOrganizationDetailsState(details);
        if (details) {
          setActiveOrganizationIdState(id);
        } else {
          toast.error(`Organization (ID: ${id}) not found or inaccessible.`);
          if (activeOrganizationId === id) setActiveOrganizationIdState(null);
        }
        return details;
      } catch (error: any) {
        toast.error("Could not load organization details.");
        setActiveOrganizationDetailsState(null);
        if (activeOrganizationId === id) setActiveOrganizationIdState(null);
        return null;
      } finally {
        setIsLoadingOrgDetails(false);
      }
    },
    [activeOrganizationId]
  );

  const clearActiveAgency = useCallback(() => {
    setActiveAgencyIdState(null);
    setActiveAgencyDetailsState(null);
  }, []);

  const setActiveOrganization = useCallback(
    async (orgId: string | null, orgDetails?: OrganizationDto) => {
      clearActiveAgency();
      setActiveOrganizationIdState(orgId);
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

  const fetchAgenciesForCurrentOrg = useCallback(async () => {
    if (!activeOrganizationId) {
      setAgenciesForCurrentOrg([]);
      setIsLoadingAgencies(false);
      return;
    }
    setIsLoadingAgencies(true);
    try {
      const agencies = await organizationRepository.getAgencies(
        activeOrganizationId
      );
      setAgenciesForCurrentOrg(agencies || []);
    } catch (error: any) {
      toast.error("Could not load agencies for the organization.");
      setAgenciesForCurrentOrg([]);
    } finally {
      setIsLoadingAgencies(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    // When the active organization changes, fetch its agencies.
    if (activeOrganizationId) {
      fetchAgenciesForCurrentOrg();
    } else {
      setAgenciesForCurrentOrg([]); // Clear agencies if no org is active
    }
  }, [activeOrganizationId, fetchAgenciesForCurrentOrg]);

  const fetchAndSetAgencyDetails = useCallback(
    async (agencyId: string) => {
      if (!activeOrganizationId) return;
      setIsLoadingAgencyDetails(true);
      try {
        const details = await organizationRepository.getAgencyById(
          activeOrganizationId,
          agencyId
        );
        setActiveAgencyDetailsState(details);
        if (!details) {
          toast.error(`Could not load details for agency ID: ${agencyId}.`);
          setActiveAgencyIdState(null);
        }
      } catch (error: any) {
        toast.error("Failed to fetch agency details.");
        setActiveAgencyDetailsState(null);
        setActiveAgencyIdState(null);
      } finally {
        setIsLoadingAgencyDetails(false);
      }
    },
    [activeOrganizationId]
  );

  const setActiveAgency = useCallback(
    async (agencyId: string | null, agencyDetails?: AgencyDto) => {
      setActiveAgencyIdState(agencyId);
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
    } catch (error: any) {
      toast.error("Could not load your organizations.");
      setUserOrganizations([]);
    } finally {
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
    }
  }, [sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && !isOrgContextInitialized) {
      fetchUserOrganizationsList();
    } else if (sessionStatus === "unauthenticated") {
      setUserOrganizations([]);
      clearActiveAgency();
      setActiveOrganizationIdState(null);
      setActiveOrganizationDetailsState(null);
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(false);
    }
  }, [
    sessionStatus,
    fetchUserOrganizationsList,
    clearActiveAgency,
    isOrgContextInitialized,
  ]);

  return (
    <ActiveOrganizationContext.Provider
      value={{
        activeOrganizationId,
        setActiveOrganization,
        activeOrganizationDetails,
        fetchAndSetOrganizationDetails: internalFetchAndSetOrgDetails,
        isLoadingOrgDetails,
        userOrganizations,
        fetchUserOrganizationsList,
        isLoadingUserOrgs,
        isOrgContextInitialized,
        activeAgencyId,
        activeAgencyDetails,
        isLoadingAgencyDetails,
        setActiveAgency,
        clearActiveAgency,
        agenciesForCurrentOrg, // <-- PROVIDE NEW STATE
        isLoadingAgencies, // <-- PROVIDE NEW STATE
        fetchAgenciesForCurrentOrg, // <-- PROVIDE NEW ACTION
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
