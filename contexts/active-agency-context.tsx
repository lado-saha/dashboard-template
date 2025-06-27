"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { AgencyDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { useActiveOrganization } from "./active-organization-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ActiveAgencyContextType {
  activeAgencyId: string | null;
  setActiveAgency: (
    agencyId: string | null,
    agencyDetails?: AgencyDto
  ) => Promise<void>;
  activeAgencyDetails: AgencyDto | null;
  agenciesForCurrentOrg: AgencyDto[];
  isLoadingAgencies: boolean;
  isLoadingAgencyDetails: boolean;
  isAgencyContextInitialized: boolean;
  fetchAgenciesForCurrentOrg: () => Promise<void>;
  clearActiveAgency: () => void;
}

const ActiveAgencyContext = createContext<ActiveAgencyContextType | undefined>(
  undefined
);

export const ActiveAgencyProvider = ({ children }: { children: ReactNode }) => {
  const { activeOrganizationId, isOrgContextInitialized } =
    useActiveOrganization();
  const router = useRouter();

  const [activeAgencyId, setActiveAgencyIdState] = useState<string | null>(
    null
  );
  const [activeAgencyDetails, setActiveAgencyDetailsState] =
    useState<AgencyDto | null>(null);
  const [agenciesForCurrentOrg, setAgenciesForCurrentOrg] = useState<
    AgencyDto[]
  >([]);

  const [isLoadingAgencies, setIsLoadingAgencies] = useState(true);
  const [isLoadingAgencyDetails, setIsLoadingAgencyDetails] = useState(false);
  const [isAgencyContextInitialized, setIsAgencyContextInitialized] =
    useState(false);

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
      setIsAgencyContextInitialized(true);
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
        if (!details) {
          toast.error(`Could not load details for agency ID: ${agencyId}.`);
          setActiveAgencyIdState(null); // Clear ID if details fail
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

  const clearActiveAgency = useCallback(() => {
    setActiveAgencyIdState(null);
    setActiveAgencyDetailsState(null);
  }, []);

  useEffect(() => {
    // When the parent organization context is ready, fetch the list of its agencies.
    if (isOrgContextInitialized) {
      fetchAgenciesForCurrentOrg();
    }
  }, [isOrgContextInitialized, fetchAgenciesForCurrentOrg]);

  return (
    <ActiveAgencyContext.Provider
      value={{
        activeAgencyId,
        setActiveAgency,
        activeAgencyDetails,
        agenciesForCurrentOrg,
        isLoadingAgencies,
        isLoadingAgencyDetails,
        isAgencyContextInitialized,
        fetchAgenciesForCurrentOrg,
        clearActiveAgency,
      }}
    >
      {children}
    </ActiveAgencyContext.Provider>
  );
};

export const useActiveAgency = (): ActiveAgencyContextType => {
  const context = useContext(ActiveAgencyContext);
  if (context === undefined) {
    throw new Error(
      "useActiveAgency must be used within an ActiveAgencyProvider"
    );
  }
  return context;
};
