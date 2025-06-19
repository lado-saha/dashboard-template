"use client";

import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import React from "react";
import { ActiveOrganizationProvider } from "@/contexts/active-organization-context";
import { AppFooter } from "@/components/app-footer"; // Import the footer

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ActiveOrganizationProvider>
      {/* Use min-h-screen on the outer div and flex-col to push footer down */}
      <div className="flex min-h-screen">
        <Sidebar />
        {/* This inner div will grow and push the footer */}
        <div className="flex flex-1 flex-col overflow-x-hidden">
          {" "}
          {/* Changed overflow-auto to overflow-x-hidden */}
          <TopNav />
          <main className="flex-1 p-4 pt-20 sm:p-6 md:p-8">
            {" "}
            {/* main content grows */}
            <div className="mx-auto">{children}</div>
          </main>
          <AppFooter /> {/* Add the footer here */}
        </div>
      </div>
    </ActiveOrganizationProvider>
  );
}
