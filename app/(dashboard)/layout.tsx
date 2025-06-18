"use client"; // If providers are client-side, this layout might need to be too

import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import React from "react";
import { ActiveOrganizationProvider } from "@/contexts/active-organization-context"; // Import the provider

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    // ActiveOrganizationProvider now wraps the entire dashboard content
    // This makes the context available to Sidebar, TopNav, and all dashboard pages.
    <ActiveOrganizationProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-auto">
          <TopNav />
          <main className="flex-1 p-4 pt-20 sm:p-6 md:p-8">
            <div className="container mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ActiveOrganizationProvider>
  );
}
