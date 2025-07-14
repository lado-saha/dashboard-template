"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { AgencyDto, OrganizationDto } from "@/types/organization";
import { organizationRepository } from "@/lib/data-repo/organization";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useRouter, usePathname } from "next/navigation";

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
  clearActiveOrganization: () => void;
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
  const {
    data: session,
    status: sessionStatus,
    update: updateSession,
  } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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

  const clearActiveOrganization = useCallback(() => {
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

  const clearActiveAgency = useCallback(() => {
    setActiveAgencyIdState(null);
    setActiveAgencyDetailsState(null);
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
        clearActiveOrganization();
        return null;
      } finally {
        setIsLoadingOrgDetails(false);
      }
    },
    [setActiveOrganizationDetailsState, clearActiveOrganization]
  );

  const setActiveOrganization = useCallback(
    async (orgId: string | null, orgDetails?: OrganizationDto) => {
      clearActiveAgency();
      setActiveOrganizationIdState(orgId);
      await updateSession({ activeOrganizationId: orgId });

      if (orgDetails && orgId === orgDetails.organization_id) {
        setActiveOrganizationDetailsState(orgDetails);
      } else if (orgId) {
        await fetchAndSetOrganizationDetails(orgId);
      } else {
        setActiveOrganizationDetailsState(null);
      }
    },
    [
      clearActiveAgency,
      fetchAndSetOrganizationDetails,
      setActiveOrganizationIdState,
      setActiveOrganizationDetailsState,
      updateSession,
    ]
  );

  const fetchUserOrganizationsList = useCallback(async () => {
    if (!session?.user.id) {
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
      return;
    }
    setIsLoadingUserOrgs(true);
    try {
      const myOrgs = await organizationRepository.getMyOrganizations();
      setUserOrganizations(myOrgs || []);

      const hasOrgs = myOrgs && myOrgs.length > 0;
      const isCurrentlyBA = !!session.user.businessActorId;

      if (hasOrgs && !isCurrentlyBA) {
        await updateSession({ businessActorId: session.user.id });
        toast.info("Business workspace activated!");
      } else if (!hasOrgs && isCurrentlyBA) {
        await updateSession({ businessActorId: null });
        clearActiveOrganization();
      }

      if (hasOrgs) {
        const storedOrgId = localStorage
          .getItem("activeOrgId")
          ?.replace(/"/g, "");
        const orgExists = myOrgs.some(
          (org) => org.organization_id === storedOrgId
        );
        if (storedOrgId && orgExists) {
          if (!activeOrganizationId || activeOrganizationId !== storedOrgId) {
            await setActiveOrganization(storedOrgId);
          }
        } else {
          await setActiveOrganization(myOrgs[0].organization_id!, myOrgs[0]);
        }
      } else {
        clearActiveOrganization();
        if (pathname.startsWith("/business-actor") && !pathname.startsWith("/business-actor/organization/create")) {
          router.push("/dashboard");
          toast.error(
            "You must have atleast organization to access the business workspace."
          );
        }
      }
    } catch (error) {
      // toast.error("Could not load your organizations.");
      setUserOrganizations([]);
      clearActiveOrganization();
    } finally {
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
    }
  }, [
    session,
    pathname,
    router,
    activeOrganizationId,
    setActiveOrganization,
    clearActiveOrganization,
    updateSession,
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
      clearActiveOrganization();
      setIsLoadingUserOrgs(false);
      setIsOrgContextInitialized(true);
    }
  }, [sessionStatus, fetchUserOrganizationsList, clearActiveOrganization]);

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
        clearActiveOrganization,
        clearActiveAgency,
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
