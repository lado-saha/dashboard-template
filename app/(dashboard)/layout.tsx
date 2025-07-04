"use client";

import { MainSidebar } from "@/components/main-sidebar"; // THE FIX: Using the dynamic sidebar directly
import { TopNav } from "@/components/top-nav";
import { ActiveOrganizationProvider } from "@/contexts/active-organization-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ActiveOrganizationProvider>
      <div className="flex min-h-screen">
        <MainSidebar /> {/* THE FIX: Sidebar is now dynamic and handles role logic itself */}

        <div className="flex flex-1 flex-col overflow-x-hidden">
          <TopNav />
          <main className="flex-1 bg-muted/30 p-4 pt-20 sm:p-6 md:p-8">
            <div className="mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ActiveOrganizationProvider>
  );
}