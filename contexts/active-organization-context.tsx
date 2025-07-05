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
import { extractId } from "@/lib/id-parser";

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

  fetchUserOrganizationsList: (businessActorId: string) => Promise<void>;
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

  const [activeOrganizationId, setActiveOrganizationIdState] = useState<
    string | null
  >(null);

  const [activeOrganizationDetails, setActiveOrganizationDetailsState] =
    useState<OrganizationDto | null>(null);
  const [isLoadingOrgDetails, setIsLoadingOrgDetails] =
    useState<boolean>(false);

  const [userOrganizations, setUserOrganizations] = useState<OrganizationDto[]>(
    []
  );
  const [isLoadingUserOrgs, setIsLoadingUserOrgs] = useState<boolean>(true);
  const [isOrgContextInitialized, setIsOrgContextInitialized] =
    useState<boolean>(false);

  const [activeAgencyId, setActiveAgencyIdState] = useState<string | null>(
    null
  );
  const [activeAgencyDetails, setActiveAgencyDetailsState] =
    useState<AgencyDto | null>(null);
  const [isLoadingAgencyDetails, setIsLoadingAgencyDetails] = useState(false);

  const [agenciesForCurrentOrg, setAgenciesForCurrentOrg] = useState<
    AgencyDto[]
  >([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(false);

  const clearActiveEntities = useCallback(() => {
    setActiveOrganizationIdState(null);
    setActiveOrganizationDetailsState(null);
    setActiveAgencyIdState(null);
    setActiveAgencyDetailsState(null);
    setAgenciesForCurrentOrg([]);
  }, []);

  const fetchAndSetOrganizationDetails = useCallback(
    async (id: string): Promise<OrganizationDto | null> => {
      setIsLoadingOrgDetails(true);
      try {
        const details = await organizationRepository.getOrganizationById(id);
        setActiveOrganizationDetailsState(details);
        return details;
      } catch (error) {
        toast.error("Could not load organization details.");
        clearActiveEntities();
        return null;
      } finally {
        setIsLoadingOrgDetails(false);
      }
    },
    [clearActiveEntities]
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
    [fetchAndSetOrganizationDetails]
  );

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
    if (!session?.user.businessActorId) {
      // No need to fetch if the user is not a BA.
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
      return;
    }
    setIsLoadingUserOrgs(true);
    try {
      // In this workaround, we have to fetch ALL orgs and filter on the client.
      const allOrgs = await organizationRepository.getAllOrganizations();
      const myOrgs = allOrgs.filter(
        (org) => org.business_actor_id === session.user.businessActorId
      );
      setUserOrganizations(myOrgs || []);

      setUserOrganizations(myOrgs || []);
      // setOrganiz
    } catch (error) {
      toast.error("Could not load your organizations.");
      setUserOrganizations([]);
    } finally {
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
    }
  }, [session]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session.user.businessActorId) {
      fetchUserOrganizationsList();
    } else {
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
    }
  }, [
    sessionStatus,
    session,
    // isOrgContextInitialized,
    // fetchUserOrganizationsList,
  ]);

  useEffect(() => {
    if (activeOrganizationId) {
      fetchAgenciesForCurrentOrg();
    } else {
      setAgenciesForCurrentOrg([]);
    }
  }, [activeOrganizationId, fetchAgenciesForCurrentOrg]);

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
