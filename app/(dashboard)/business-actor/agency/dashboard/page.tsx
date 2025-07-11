"use client";

import React, { useEffect, useState } from "react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  Briefcase,
  UserPlus,
  ArrowLeft,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data - replace with actual API calls scoped to the agencyId
const getMockAgencyStats = () => ({
  sales: 12550.45,
  newProspects: 32,
  teamMembers: 8,
  monthlySales: [
    { name: "Jan", sales: 1200 },
    { name: "Feb", sales: 1800 },
    { name: "Mar", sales: 1500 },
    { name: "Apr", sales: 2100 },
    { name: "May", sales: 1900 },
    { name: "Jun", sales: 2500 },
    { name: "Jul", sales: 2800 },
  ],
  employees: [
    {
      name: "Charlie Davis",
      role: "MANAGER",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708d",
    },
    {
      name: "Dana Miller",
      role: "SALES",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026709d",
    },
    {
      name: "Evan Garcia",
      role: "SUPPORT",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026710d",
    },
    {
      name: "Fiona Clark",
      role: "SALES",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026711d",
    },
  ],
});

export default function AgencyDashboardPage() {
  const router = useRouter();
  const { activeAgencyDetails, isLoadingAgencyDetails, clearActiveEntities } =
    useActiveOrganization();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // In a real app, fetch these stats using activeAgencyDetails.agency_id
    if (activeAgencyDetails) {
      setStats(getMockAgencyStats());
    }
  }, [activeAgencyDetails]);

  if (isLoadingAgencyDetails || (activeAgencyDetails && !stats)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!activeAgencyDetails) {
    return (
      <Alert variant="destructive">
        <Briefcase className="h-4 w-4" />
        <AlertTitle>No Active Agency</AlertTitle>
        <AlertDescription>
          Please return to the organization dashboard to select an agency.
        </AlertDescription>
        <div className="mt-4">
          <Button
            onClick={() => router.push("/business-actor/dashboard")}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go to Organization
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Agency: {activeAgencyDetails.long_name}
          </h1>
          <p className="text-muted-foreground">
            An overview of this agency's performance and team.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/business-actor/org/agencies")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Agencies
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month's Sales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.sales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Prospects</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.newProspects}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>
              Monthly sales trend for this agency.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Roster</CardTitle>
            <CardDescription>
              Employees assigned to this agency.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.employees.map((employee: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {employee.role.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
