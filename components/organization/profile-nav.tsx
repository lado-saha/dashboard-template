"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building, BookUser, MapPinned } from "lucide-react";

const navLinks = [
  {
    name: "Edit Profile",
    href: "/business-actor/org/profile",
    tab: "edit_profile",
    icon: Building,
  },
  {
    name: "Contacts",
    href: "/business-actor/org/profile?tab=contacts",
    tab: "contacts",
    icon: BookUser,
  },
  {
    name: "Addresses",
    href: "/business-actor/org/profile?tab=addresses",
    tab: "addresses",
    icon: MapPinned,
  },
];

interface ProfileNavProps {
  activeTab: string;
}

export function ProfileNav({ activeTab }: ProfileNavProps) {
  return (
    <nav className="flex flex-col space-y-1" aria-label="Profile Sections">
      {navLinks.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          scroll={false}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeTab === link.tab
              ? "bg-muted text-primary font-semibold"
              : "hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <link.icon className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          <span>{link.name}</span>
        </Link>
      ))}
    </nav>
  );
}
