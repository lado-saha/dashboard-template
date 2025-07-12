"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { DollarSign, Users, Briefcase, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/organization/stat-card";
import { SalesChart } from "@/components/dashboard/organization/sales-chart";
import { TeamRoster } from "@/components/dashboard/agency/team-roster";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { organizationRepository } from "@/lib/data-repo/organization";
import { EmployeeDto, CustomerDto } from "@/types/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Building } from "lucide-react";

interface AgencyDashboardData {
    employeeCount: number;
    customerCount: number;
    employees: EmployeeDto[];
    error?: string | null;
}

const initialData: AgencyDashboardData = {
    employeeCount: 0,
    customerCount: 0,
    employees: [],
};

export function AgencyDashboardClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeAgencyId, activeAgencyDetails, isLoadingAgencyDetails } = useActiveOrganization();
  const [data, setData] = useState<AgencyDashboardData>(initialData);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId || !activeAgencyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
        const [employees, customers] = await Promise.all([
            organizationRepository.getAgencyEmployees(activeOrganizationId, activeAgencyId),
            organizationRepository.getAgencyCustomers(activeOrganizationId, activeAgencyId),
        ]);
        setData({
            employeeCount: employees?.length || 0,
            customerCount: customers?.length || 0,
            employees: employees || [],
        });
    } catch (error: any) {
        setData({ ...initialData, error: "Failed to load agency dashboard data." });
    } finally {
        setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId]);

  useEffect(() => {
    if (activeAgencyId) {
      fetchData();
    } else if (!isLoadingAgencyDetails) {
      setIsLoading(false);
    }
  }, [activeAgencyId, isLoadingAgencyDetails, fetchData]);

  if (isLoading || isLoadingAgencyDetails) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-10 w-32" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>
        <div className="grid gap-4 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-96 w-full" />
          <Skeleton className="lg:col-span-3 h-96 w-full" />
        </div>
      </div>
    );
  }
  
  if (!activeAgencyId) {
      return <FeedbackCard icon={Building} title="No Agency Selected" description="Please select an agency from the switcher in the sidebar to view its dashboard." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={activeAgencyDetails?.long_name || "Agency Dashboard"}
        description="A focused overview of this agency's performance."
        action={
            <Button variant="outline" size="sm" onClick={() => router.push('/business-actor/org/agencies')}>
                Back to All Agencies
            </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Revenue" value={`$${(activeAgencyDetails?.average_revenue || 0).toLocaleString()}`} description="Agency's estimated monthly takings" icon={DollarSign} />
        <StatCard title="Agency Customers" value={`${data.customerCount}`} description="Total clients managed by this agency" icon={Briefcase} />
        <StatCard title="Team Members" value={`${data.employeeCount}`} description="Active employees in this agency" icon={Users} />
        <StatCard title="New Prospects" value="+12" description="This month" icon={UserPlus} />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <SalesChart />
        <TeamRoster employees={data.employees} />
      </div>
    </div>
  );
}
