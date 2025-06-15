"use client"; // Provider needs to be a client component

import React from "react";
import { ActiveOrganizationProvider } from "@/contexts/active-organization-context"; // Corrected filename

interface BusinessActorLayoutProps {
  children: React.ReactNode;
}

export default function BusinessActorLayout({
  children,
}: BusinessActorLayoutProps) {
  // This layout wraps all content specific to the Business Actor role.
  // The ActiveOrganizationProvider will make the organization context
  // available to all child pages and components.
  return (
    <ActiveOrganizationProvider>
      {/*
        The actual visual layout (Sidebar, TopNav) is likely handled by
        app/(dashboard)/layout.tsx. This layout.tsx is primarily for
        providing context specific to the /business-actor/* routes.
        If you need a distinct visual layout here (e.g. a secondary sidebar for org management),
        you would add it here. For now, it just provides context.
      */}
      {children}
    </ActiveOrganizationProvider>
  );
}
