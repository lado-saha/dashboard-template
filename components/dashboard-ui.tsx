"use client";

import { usePathname } from "next/navigation";
import { MainSidebar } from "@/components/main-sidebar";
import { AgencySidebar } from "@/components/organization/agencies/agency-sidebar";
// import { Sidebar } from "@/components/main-sidebar";

export function DashboardUI() {
  const pathname = usePathname();

  // This component now *only* decides which self-contained sidebar to render.
  if (pathname.startsWith("/business-actor/agency")) {
    return <AgencySidebar />;
  }

  // Default to the main sidebar for all other dashboard routes.
  return <MainSidebar />;
}
