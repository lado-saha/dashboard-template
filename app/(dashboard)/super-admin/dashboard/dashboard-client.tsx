"use client";

import React, { useMemo } from "react";
import { UserDto } from "@/types/auth";
import { OrganizationDto, BusinessActorDto } from "@/types/organization";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/dashboard/organization/stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Users, Building, Briefcase, CheckCircle, Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Pie, PieChart, Cell } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SuperAdminDashboardData {
  users: UserDto[];
  organizations: OrganizationDto[];
  businessActors: BusinessActorDto[];
  error?: string | null;
}

interface SuperAdminDashboardClientPageProps {
  initialData: SuperAdminDashboardData;
}

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--primary) / 0.8)", "hsl(var(--primary) / 0.6)", "hsl(var(--primary) / 0.4)"];

export function SuperAdminDashboardClientPage({ initialData }: SuperAdminDashboardClientPageProps) {
  const { users, organizations, businessActors } = initialData;

  const orgStatusData = useMemo(() => {
    const counts = organizations.reduce((acc, org) => {
      const status = org.status || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [organizations]);

  const baTypeData = useMemo(() => {
    const counts = businessActors.reduce((acc, actor) => {
      const type = actor.type || "GUEST";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [businessActors]);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5);
  }, [users]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Overview"
        description="A comprehensive, real-time view of all system activities and entities."
      />

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
                  {orgStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard title="Business Actor Types" description="Breakdown of business actors by their primary role." icon={Briefcase}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={baTypeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#888888" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} width={120} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Count" barSize={25} />
              </BarChart>
            </ResponsiveContainer>
        </DashboardCard>
      </div>

      <DashboardCard title="Recently Registered Users" description="The latest users to join the platform." icon={Users}>
        <ScrollArea className="h-[300px]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Registered On</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentUsers.map(user => {
                        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                        return (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9"><AvatarFallback>{name.charAt(0) || 'U'}</AvatarFallback></Avatar>
                                        <div className="font-medium">{name}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{user.username}</TableCell>
                                <TableCell className="text-muted-foreground">{new Date(user.created_at!).toLocaleDateString()}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </ScrollArea>
      </DashboardCard>

    </div>
  );
}
