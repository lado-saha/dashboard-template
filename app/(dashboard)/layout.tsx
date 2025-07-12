"use client";

import { MainSidebar } from "@/components/main-sidebar"; // [CHANGE] Use the new intelligent sidebar
import { TopNav } from "@/components/top-nav";
import { ActiveOrganizationProvider } from "@/contexts/active-organization-context";
import { CommandPalette } from "@/components/command-palette";
import { useCommandPalette } from "@/hooks/use-command-palette";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isOpen, setIsOpen } = useCommandPalette();

  return (
    <ActiveOrganizationProvider>
      <CommandPalette isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex min-h-screen">
        <MainSidebar /> 
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <TopNav onOpenCommandPalette={() => setIsOpen(true)} />
          <main className="flex-1 bg-muted/30 p-4 pt-20 sm:p-6 md:p-8">
            <div className="mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ActiveOrganizationProvider>
  );
}
