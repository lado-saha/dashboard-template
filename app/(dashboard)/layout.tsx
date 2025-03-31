// FILE: app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/sidebar"; // Check this import path
import { TopNav } from "@/components/top-nav";   // Check this import path
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Ensure this structure is correct
  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* Is Sidebar component okay? */}
      <div className="flex flex-1 flex-col overflow-auto">
        <TopNav /> {/* Is TopNav component okay? */}
        <main className="flex-1 p-4 pt-20 sm:p-6 md:p-8">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}