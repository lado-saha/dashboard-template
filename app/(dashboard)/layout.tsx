"use client";

import { MainSidebar } from "@/components/main-sidebar";
import { TopNav } from "@/components/top-nav";
import { ActiveOrganizationProvider } from "@/contexts/active-organization-context";
import { CommandPalette } from "@/components/command-palette"; // [ADD]
import { useCommandPalette } from "@/hooks/use-command-palette"; // [ADD]

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen, setIsOpen } = useCommandPalette(); // [ADD]

  return (
    <ActiveOrganizationProvider>
      {/* [ADD] Mount the command palette here */}
      <CommandPalette isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex min-h-screen">
        <MainSidebar />
        <div className="flex flex-1 flex-col overflow-x-hidden">
          {/* [CHANGE] Pass the setter to TopNav */}
          <TopNav onOpenCommandPalette={() => setIsOpen(true)} />
          <main className="flex-1 bg-muted/30 p-4 pt-20 sm:p-6 md:p-8">
            <div className="mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ActiveOrganizationProvider>
  );
}