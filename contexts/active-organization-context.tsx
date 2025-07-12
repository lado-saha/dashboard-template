"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { OrganizationDto, AgencyDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface ActiveOrganizationContextType {
  activeOrganizationId: string | null;
  activeOrganizationDetails: OrganizationDto | null;
  isLoadingOrgDetails: boolean;
  userOrganizations: OrganizationDto[];
  isLoadingUserOrgs: boolean;
  isOrgContextInitialized: boolean;
  setActiveOrganization: (
    orgId: string | null,
    orgDetails?: OrganizationDto
  ) => Promise<void>;
  fetchUserOrganizationsList: () => Promise<void>;
  fetchAgenciesForCurrentOrg: () => Promise<void>;
  fetchAndSetOrganizationDetails: (
    id: string
  ) => Promise<OrganizationDto | null>;
  activeAgencyId: string | null;
  activeAgencyDetails: AgencyDto | null;
  isLoadingAgencyDetails: boolean;
  setActiveAgency: (
    agencyId: string | null,
    agencyDetails?: AgencyDto
  ) => Promise<void>;
  agenciesForCurrentOrg: AgencyDto[];
  isLoadingAgencies: boolean;
  clearActiveEntities: () => void;
  clearActiveAgency: () => void;
  clearActiveOrganization: () => void;
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

  const [activeOrganizationId, setActiveOrganizationIdState] = useLocalStorage<
    string | null
  >("activeOrgId", null);
  const [activeOrganizationDetails, setActiveOrganizationDetailsState] =
    useLocalStorage<OrganizationDto | null>("activeOrgDetails", null);
  const [activeAgencyId, setActiveAgencyIdState] = useLocalStorage<
    string | null
  >("activeAgencyId", null);
  const [activeAgencyDetails, setActiveAgencyDetailsState] =
    useLocalStorage<AgencyDto | null>("activeAgencyDetails", null);

  const [isLoadingOrgDetails, setIsLoadingOrgDetails] =
    useState<boolean>(false);
  const [userOrganizations, setUserOrganizations] = useState<OrganizationDto[]>(
    []
  );
  const [isLoadingUserOrgs, setIsLoadingUserOrgs] = useState<boolean>(true);
  const [isOrgContextInitialized, setIsOrgContextInitialized] =
    useState<boolean>(false);
  const [agenciesForCurrentOrg, setAgenciesForCurrentOrg] = useState<
    AgencyDto[]
  >([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(false);
  const [isLoadingAgencyDetails, setIsLoadingAgencyDetails] = useState(false);

  const clearActiveEntities = useCallback(() => {
    setActiveOrganizationIdState(null);
    setActiveOrganizationDetailsState(null);
    setActiveAgencyIdState(null);
    setActiveAgencyDetailsState(null);
    setAgenciesForCurrentOrg([]);
  }, [
    setActiveOrganizationIdState,
    setActiveOrganizationDetailsState,
    setActiveAgencyIdState,
    setActiveAgencyDetailsState,
  ]);

  const clearActiveOrganization = useCallback(() => {
    setActiveOrganizationIdState(null);
    setActiveOrganizationDetailsState(null);
    // Also clear agency context when exiting the organization
    setActiveAgencyIdState(null);
    setActiveAgencyDetailsState(null);
    setAgenciesForCurrentOrg([]);
  }, [
    setActiveOrganizationIdState,
    setActiveOrganizationDetailsState,
    setActiveAgencyIdState,
    setActiveAgencyDetailsState,
  ]);

  const clearActiveAgency = useCallback(() => {
    setActiveAgencyIdState(null);
    setActiveAgencyDetailsState(null);
    setAgenciesForCurrentOrg([]);
  }, [setActiveAgencyIdState, setActiveAgencyDetailsState]);

  const fetchAndSetOrganizationDetails = useCallback(
    async (id: string): Promise<OrganizationDto | null> => {
      setIsLoadingOrgDetails(true);
      try {
        const details = await organizationRepository.getOrganizationById(id);
        setActiveOrganizationDetailsState(details);
        return details;
      } catch (error) {
        toast.error("Could not load organization details. Clearing selection.");
        clearActiveEntities();
        return null;
      } finally {
        setIsLoadingOrgDetails(false);
      }
    },
    [setActiveOrganizationDetailsState, clearActiveEntities]
  );

  const setActiveOrganization = useCallback(
    async (orgId: string | null, orgDetails?: OrganizationDto) => {
      setActiveAgencyIdState(null);
      setActiveAgencyDetailsState(null);
      setAgenciesForCurrentOrg([]);
      setActiveOrganizationIdState(orgId);
      if (orgDetails && orgId === orgDetails.organization_id) {
        setActiveOrganizationDetailsState(orgDetails);
      } else if (orgId) {
        await fetchAndSetOrganizationDetails(orgId);
      } else {
        setActiveOrganizationDetailsState(null);
      }
    },
    [
      fetchAndSetOrganizationDetails,
      setActiveOrganizationIdState,
      setActiveOrganizationDetailsState,
      setActiveAgencyIdState,
      setActiveAgencyDetailsState,
    ]
  );

  const fetchUserOrganizationsList = useCallback(async () => {
    if (!session?.user.businessActorId) {
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
      return;
    }
    setIsLoadingUserOrgs(true);
    try {
      const myOrgs = await organizationRepository.getMyOrganizations();
      setUserOrganizations(myOrgs || []);

      const storedOrgId = getLocalStorageItem("activeOrgId");
      const storedOrgDetails = getLocalStorageItem("activeOrgDetails");

      if (
        storedOrgId &&
        myOrgs.some((org) => org.organization_id === storedOrgId)
      ) {
        if (
          !activeOrganizationDetails ||
          activeOrganizationDetails.organization_id !== storedOrgId
        ) {
          setActiveOrganizationDetailsState(storedOrgDetails);
        }
      } else if (myOrgs.length > 0) {
        await setActiveOrganization(myOrgs[0].organization_id!, myOrgs[0]);
      } else {
        clearActiveEntities();
      }
    } catch (error) {
      toast.error("Could not load your organizations.");
      setUserOrganizations([]);
      clearActiveEntities();
    } finally {
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
    }
  }, [
    session,
    setActiveOrganization,
    clearActiveEntities,
    activeOrganizationDetails,
    setActiveOrganizationDetailsState,
  ]);

  const fetchAgenciesForCurrentOrg = useCallback(async () => {
    if (!activeOrganizationId) return;
    setIsLoadingAgencies(true);
    try {
      const agencies = await organizationRepository.getAgencies(
        activeOrganizationId
      );
      setAgenciesForCurrentOrg(agencies || []);
    } catch (error) {
      toast.error("Could not load agencies for this organization.");
    } finally {
      setIsLoadingAgencies(false);
    }
  }, [activeOrganizationId]);

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
      } catch (error) {
        toast.error("Failed to fetch agency details.");
      } finally {
        setIsLoadingAgencyDetails(false);
      }
    },
    [activeOrganizationId, setActiveAgencyDetailsState]
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
    [
      fetchAndSetAgencyDetails,
      setActiveAgencyIdState,
      setActiveAgencyDetailsState,
    ]
  );

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchUserOrganizationsList();
    } else if (sessionStatus === "unauthenticated") {
      clearActiveEntities();
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
    }
  }, [sessionStatus, fetchUserOrganizationsList, clearActiveEntities]);

  useEffect(() => {
    if (activeOrganizationId) {
      fetchAgenciesForCurrentOrg();
    } else {
      setAgenciesForCurrentOrg([]);
    }
  }, [activeOrganizationId, fetchAgenciesForCurrentOrg]);

  const getLocalStorageItem = (key: string) => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  };

  return (
    <ActiveOrganizationContext.Provider
      value={{
        activeOrganizationId,
        activeOrganizationDetails,
        isLoadingOrgDetails,
        userOrganizations,
        isLoadingUserOrgs,
        isOrgContextInitialized,
        setActiveOrganization,
        fetchUserOrganizationsList,
        fetchAgenciesForCurrentOrg,
        fetchAndSetOrganizationDetails,
        activeAgencyId,
        activeAgencyDetails,
        isLoadingAgencyDetails,
        setActiveAgency,
        agenciesForCurrentOrg,
        isLoadingAgencies,
        clearActiveEntities,
        clearActiveAgency,
        clearActiveOrganization,
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
