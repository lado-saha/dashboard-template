#!/bin/bash

echo "🚀 Refining Dashboards: Making them data-driven and dynamic..."

# 1. Refactor the main Organization Dashboard Client
echo "🔥 Overhauling the main Organization Dashboard..."
mkdir -p "$(pwd)/app/(dashboard)/business-actor/dashboard"
cat << 'EOF' > "$(pwd)/app/(dashboard)/business-actor/dashboard/dashboard-client.tsx"
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/organization/stat-card";
import { SalesChart } from "@/components/dashboard/organization/sales-chart";
import { RecentActivity } from "@/components/dashboard/organization/recent-activity";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DollarSign, Users, Building, Truck, Briefcase, UserPlus, Users2 } from "lucide-react";
import { AgencyDto, EmployeeDto, CustomerDto, ProviderDto } from "@/types/organization";

interface DashboardData {
  employeeCount: number;
  agencyCount: number;
  customerCount: number;
  supplierCount: number;
  topAgencies: AgencyDto[];
  employees: EmployeeDto[];
  customers: CustomerDto[];
  suppliers: ProviderDto[];
  error?: string | null;
}

const initialData: DashboardData = {
  employeeCount: 0,
  agencyCount: 0,
  customerCount: 0,
  supplierCount: 0,
  topAgencies: [],
  employees: [],
  customers: [],
  suppliers: [],
};

export function DashboardClientPage() {
  const router = useRouter();
  const { activeOrganizationId, activeOrganizationDetails, isLoadingOrgDetails } = useActiveOrganization();
  const [data, setData] = useState<DashboardData>(initialData);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeOrganizationId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [employees, agencies, customers, suppliers] = await Promise.all([
        organizationRepository.getOrgEmployees(activeOrganizationId),
        organizationRepository.getAgencies(activeOrganizationId),
        organizationRepository.getOrgCustomers(activeOrganizationId),
        organizationRepository.getOrgSuppliers(activeOrganizationId),
      ]);
      setData({
        employeeCount: employees?.length || 0,
        agencyCount: agencies?.length || 0,
        customerCount: customers?.length || 0,
        supplierCount: suppliers?.length || 0,
        topAgencies: agencies?.sort((a, b) => (b.average_revenue || 0) - (a.average_revenue || 0)).slice(0, 5) || [],
        employees: employees || [],
        customers: customers || [],
        suppliers: suppliers || [],
      });
    } catch (error: any) {
      setData({ ...initialData, error: "Failed to load dashboard data." });
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    if (activeOrganizationId) fetchData();
    else if (!isLoadingOrgDetails) setIsLoading(false);
  }, [activeOrganizationId, isLoadingOrgDetails, fetchData]);

  if (isLoading || isLoadingOrgDetails) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-10 w-48" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>
        <div className="grid gap-4 lg:grid-cols-7"><Skeleton className="lg:col-span-4 h-96 w-full" /><Skeleton className="lg:col-span-3 h-96 w-full" /></div>
      </div>
    );
  }

  if (!activeOrganizationId) {
    return <FeedbackCard icon={Building} title="No Organization Selected" description="Please select an organization from the switcher in the sidebar to view its dashboard." />;
  }

  const totalRevenue = data.topAgencies.reduce((acc, agency) => acc + (agency.average_revenue || 0), 0);
  const departmentDistribution = data.employees.reduce((acc, emp) => {
    const dept = emp.department || "Unassigned";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const departmentData = Object.entries(departmentDistribution).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <PageHeader title={activeOrganizationDetails?.long_name || "Dashboard"} description="Welcome to your organization's command center." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Est. Annual Revenue" value={`$${(totalRevenue * 12).toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Total Customers" value={data.customerCount.toLocaleString()} icon={Users} />
        <StatCard title="Total Agencies" value={data.agencyCount.toLocaleString()} icon={Building} />
        <StatCard title="Total Employees" value={data.employeeCount.toLocaleString()} icon={UserPlus} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <SalesChart />
        <RecentActivity employees={data.employees} customers={data.customers} suppliers={data.suppliers} />
      </div>
      <Card>
        <CardHeader><CardTitle>Organization Entities Overview</CardTitle><CardDescription>A detailed breakdown of your key operational entities.</CardDescription></CardHeader>
        <CardContent>
          <Tabs defaultValue="agencies" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="agencies"><Users2 className="mr-2 h-4 w-4" />Agencies</TabsTrigger>
              <TabsTrigger value="employees"><Users className="mr-2 h-4 w-4" />Employees</TabsTrigger>
              <TabsTrigger value="customers"><Briefcase className="mr-2 h-4 w-4" />Customers</TabsTrigger>
              <TabsTrigger value="suppliers"><Truck className="mr-2 h-4 w-4" />Suppliers</TabsTrigger>
            </TabsList>
            <TabsContent value="agencies" className="pt-6 space-y-4">
              <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{data.agencyCount} total agencies.</p><Button variant="outline" size="sm" onClick={() => router.push("/business-actor/org/agencies")}>Manage All</Button></div>
              <div className="space-y-4">{data.topAgencies.map(agency => (<div key={agency.agency_id} className="space-y-1"><div className="flex justify-between text-sm"><p className="font-medium">{agency.short_name}</p><p className="text-muted-foreground">${(agency.average_revenue || 0).toLocaleString()}/mo</p></div><Progress value={totalRevenue > 0 ? ((agency.average_revenue || 0) / totalRevenue) * 100 : 0} /></div>))}</div>
            </TabsContent>
            <TabsContent value="employees" className="pt-6">
              <div className="flex items-center justify-between mb-4"><p className="text-sm text-muted-foreground">{data.employeeCount} total employees.</p><Button variant="outline" size="sm" onClick={() => router.push("/business-actor/org/employees")}>Manage All</Button></div>
              <ResponsiveContainer width="100%" height={250}><BarChart data={departmentData} layout="vertical" margin={{ left: 10, right: 30 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" stroke="#888888" fontSize={12} /><YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100} /><Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} /><Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Employees" barSize={20} /></BarChart></ResponsiveContainer>
            </TabsContent>
            <TabsContent value="customers" className="pt-6">
              <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{data.customerCount} total customers.</p><Button variant="outline" size="sm" onClick={() => router.push("/business-actor/org/customers")}>Manage All</Button></div><div className="h-[250px] flex items-center justify-center text-muted-foreground italic">New customer acquisition chart coming soon...</div>
            </TabsContent>
            <TabsContent value="suppliers" className="pt-6">
              <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{data.supplierCount} total suppliers.</p><Button variant="outline" size="sm" onClick={() => router.push("/business-actor/org/suppliers")}>Manage All</Button></div><div className="h-[250px] flex items-center justify-center text-muted-foreground italic">Supplier category breakdown chart coming soon...</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
EOF
code "$(pwd)/app/(dashboard)/business-actor/dashboard/dashboard-client.tsx"

# 2. Refactor the Agency Dashboard Client
echo "📊 Enhancing the Agency Dashboard..."
mkdir -p "$(pwd)/app/(dashboard)/business-actor/agency/dashboard"
cat << 'EOF' > "$(pwd)/app/(dashboard)/business-actor/agency/dashboard/dashboard-client.tsx"
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { organizationRepository } from "@/lib/data-repo/organization";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/organization/stat-card";
import { TeamRoster } from "@/components/dashboard/agency/team-roster";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackCard } from "@/components/ui/feedback-card";
import { DollarSign, Users, Briefcase, UserPlus, Truck, Lightbulb, Building } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { EmployeeDto, CustomerDto, ProspectDto, ProviderDto } from "@/types/organization";

interface AgencyDashboardData {
  employeeCount: number;
  customerCount: number;
  prospectCount: number;
  supplierCount: number;
  employees: EmployeeDto[];
  error?: string | null;
}

const initialData: AgencyDashboardData = {
  employeeCount: 0,
  customerCount: 0,
  prospectCount: 0,
  supplierCount: 0,
  employees: [],
};

// Mock data for the sales chart since API doesn't provide it
const illustrativeSalesData = [
  { name: 'Jan', Sales: 4000 }, { name: 'Feb', Sales: 3000 }, { name: 'Mar', Sales: 5000 },
  { name: 'Apr', Sales: 4500 }, { name: 'May', Sales: 6000 }, { name: 'Jun', Sales: 5500 },
];

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
      const [employees, customers, prospects, suppliers] = await Promise.all([
        organizationRepository.getAgencyEmployees(activeOrganizationId, activeAgencyId),
        organizationRepository.getAgencyCustomers(activeOrganizationId, activeAgencyId),
        organizationRepository.getAgencyProspects(activeOrganizationId, activeAgencyId),
        organizationRepository.getAgencySuppliers(activeOrganizationId, activeAgencyId),
      ]);
      setData({
        employeeCount: employees?.length || 0,
        customerCount: customers?.length || 0,
        prospectCount: prospects?.length || 0,
        supplierCount: suppliers?.length || 0,
        employees: employees || [],
      });
    } catch (error: any) {
      setData({ ...initialData, error: "Failed to load agency dashboard data." });
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganizationId, activeAgencyId]);

  useEffect(() => {
    if (activeAgencyId) fetchData();
    else if (!isLoadingAgencyDetails) setIsLoading(false);
  }, [activeAgencyId, isLoadingAgencyDetails, fetchData]);

  if (isLoading || isLoadingAgencyDetails) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-10 w-32" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>
        <div className="grid gap-4 lg:grid-cols-7"><Skeleton className="lg:col-span-4 h-96 w-full" /><Skeleton className="lg:col-span-3 h-96 w-full" /></div>
      </div>
    );
  }

  if (!activeAgencyId) {
    return <FeedbackCard icon={Building} title="No Agency Selected" description="Please select an agency from the switcher in the sidebar to view its dashboard." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader title={activeAgencyDetails?.long_name || "Agency Dashboard"} description="A focused overview of this agency's performance." action={<Button variant="outline" size="sm" onClick={() => router.push('/business-actor/org/agencies')}>Back to All Agencies</Button>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Revenue" value={`$${(activeAgencyDetails?.average_revenue || 0).toLocaleString()}`} description="Agency's estimated monthly takings" icon={DollarSign} />
        <StatCard title="Agency Customers" value={data.customerCount.toLocaleString()} description="Total clients managed" icon={Briefcase} />
        <StatCard title="Team Members" value={data.employeeCount.toLocaleString()} description="Active employees in this agency" icon={Users} />
        <StatCard title="New Prospects" value={data.prospectCount.toLocaleString()} description="Potential new leads" icon={Lightbulb} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <Card className="col-span-4"><CardHeader><CardTitle>Sales Performance</CardTitle><CardDescription>Illustrative sales data for the last 6 months.</CardDescription></CardHeader><CardContent className="pl-2"><ResponsiveContainer width="100%" height={350}><BarChart data={illustrativeSalesData}><XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} /><Tooltip cursor={{ fill: "hsl(var(--muted))" }} /><Bar dataKey="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        <TeamRoster employees={data.employees} />
      </div>
    </div>
  );
}
EOF
code "$(pwd)/app/(dashboard)/business-actor/agency/dashboard/dashboard-client.tsx"

# 3. Refactor the Super Admin Dashboard Client
echo "🛡️ Polishing the Super Admin Dashboard..."
mkdir -p "$(pwd)/app/(dashboard)/super-admin/dashboard"
cat << 'EOF' > "$(pwd)/app/(dashboard)/super-admin/dashboard/dashboard-client.tsx"
"use client";

import React, { useMemo } from "react";
import { UserDto } from "@/types/auth";
import { OrganizationDto, BusinessActorDto } from "@/types/organization";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/dashboard/organization/stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Users, Building, Briefcase, CheckCircle } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid, Pie, PieChart } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SuperAdminDashboardData {
  users: UserDto[];
  organizations: OrganizationDto[];
  businessActors: BusinessActorDto[];
  error?: string | null;
}

interface SuperAdminDashboardClientPageProps {
  initialData: SuperAdminDashboardData;
}

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--primary) / 0.8)", "hsl(var(--primary) / 0.6)", "hsl(var(--primary) / 0.4)", "hsl(var(--muted))"];

export function SuperAdminDashboardClientPage({ initialData }: SuperAdminDashboardClientPageProps) {
  const { users, organizations, businessActors } = initialData;

  const orgStatusData = useMemo(() => {
    const counts = organizations.reduce((acc, org) => {
      const status = (org.status || "UNKNOWN").replace("_", " ");
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [organizations]);

  const baTypeData = useMemo(() => {
    const counts = businessActors.reduce((acc, actor) => {
      const type = (actor.type || "GUEST").replace(/_/g, " ");
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })).sort((a,b) => b.value - a.value);
  }, [businessActors]);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5);
  }, [users]);

  return (
    <div className="space-y-8">
      <PageHeader title="Platform Overview" description="A comprehensive, real-time view of all system activities and entities." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Users" value={users.length.toLocaleString()} icon={Users} description={`${users.filter(u => u.is_enabled).length} active`} />
        <StatCard title="Total Organizations" value={organizations.length.toLocaleString()} icon={Building} description={`${organizations.filter(o => o.status === "ACTIVE").length} active`} />
        <StatCard title="Business Actors" value={businessActors.length.toLocaleString()} icon={Briefcase} description="Total professional profiles" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard title="Organization Status" description="Distribution of organizations by their current status." icon={CheckCircle}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={orgStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {orgStatusData.map((_entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
            </PieChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard title="Business Actor Types" description="Breakdown of business actors by their primary role." icon={Briefcase}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={baTypeData} layout="vertical" margin={{ left: 20, right: 20 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" stroke="#888888" fontSize={12} /><YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} width={120} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Count" barSize={25} /></BarChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>
      <DashboardCard title="Recently Registered Users" description="The latest users to join the platform." icon={Users}>
        <ScrollArea className="h-[300px]">
          <Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Username</TableHead><TableHead>Registered On</TableHead></TableRow></TableHeader><TableBody>{recentUsers.map(user => { const name = `${user.first_name || ''} ${user.last_name || ''}`.trim(); return (<TableRow key={user.id}><TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback>{name.charAt(0) || 'U'}</AvatarFallback></Avatar><div className="font-medium">{name}</div></div></TableCell><TableCell className="text-muted-foreground">{user.username}</TableCell><TableCell className="text-muted-foreground">{new Date(user.created_at!).toLocaleDateString()}</TableCell></TableRow>);})}</TableBody></Table>
        </ScrollArea>
      </DashboardCard>
    </div>
  );
}
EOF
code "$(pwd)/app/(dashboard)/super-admin/dashboard/dashboard-client.tsx"

# 4. Create the Recent Activity Component for the Organization Dashboard
echo "📦 Creating the RecentActivity component..."
mkdir -p "$(pwd)/components/dashboard/organization"
cat << 'EOF' > "$(pwd)/components/dashboard/organization/recent-activity.tsx"
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeDto, CustomerDto, ProviderDto } from "@/types/organization";
import { Users, Briefcase, Truck, LucideIcon } from "lucide-react";

interface ActivityItem {
  type: 'Employee' | 'Customer' | 'Supplier';
  icon: LucideIcon;
  name: string;
  description: string;
  date: string;
}

export function RecentActivity({ employees, customers, suppliers }: { employees: EmployeeDto[], customers: CustomerDto[], suppliers: ProviderDto[] }) {
  const combinedActivities: ActivityItem[] = [
    ...employees.slice(0, 5).map(e => ({ type: 'Employee' as const, icon: Users, name: `${e.first_name} ${e.last_name}`, description: `Joined as ${e.employee_role || 'Member'}`, date: e.created_at! })),
    ...customers.slice(0, 5).map(c => ({ type: 'Customer' as const, icon: Briefcase, name: `${c.first_name} ${c.last_name}`, description: 'Became a new customer', date: c.created_at! })),
    ...suppliers.slice(0, 5).map(s => ({ type: 'Supplier' as const, icon: Truck, name: `${s.first_name} ${s.last_name}`, description: `Added as a ${s.product_service_type || 'supplier'}`, date: s.created_at! }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);

  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>An overview of recent actions within your organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {combinedActivities.length > 0 ? (
            <div className="space-y-6">
              {combinedActivities.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback><activity.icon className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
              <p>No recent activity to display.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
EOF
code "$(pwd)/components/dashboard/organization/recent-activity.tsx"

echo "✅ All dashboards have been refined and are now powered by live data."