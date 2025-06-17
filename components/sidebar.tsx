"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Landmark,
  Wallet,
  HandCoins,
  Webhook,
  MessagesSquare,
  Share2,
  Star, // BA Icons
  Briefcase,
  FileText,
  FolderHeart, // Customer Icons
  Server,
  Building2 as SuperAdminOrgIcon,
  Users as SuperAdminUsersIcon, // Super Admin Icons
  LifeBuoy,
  Settings,
  LogOut,
  Menu,
  SidebarClose,
  Building,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { OrganizationSwitcher } from "@/components/organization/organization-switcher"; // NEW IMPORT
import { useActiveOrganization } from "@/contexts/active-organization-context"; // For BA to check orgs

// Navigation Arrays (keep your existing definitions)
const baNavigation = [
  { name: "Dashboard", href: "/business-actor/dashboard", icon: LayoutGrid },
  // Org-specific items will be in a sub-nav within /organization/[orgId]/layout.tsx
  // This top-level "My Organization(s)" could link to where they select/create, which is the dashboard
  { name: "Manage Active Org", href: "#", icon: Landmark, isOrgLink: true }, // Placeholder, actual link set dynamically
  { name: "Wallet", href: "/business-actor/wallet", icon: Wallet },
  { name: "Bonus Config", href: "/business-actor/bonus", icon: HandCoins },
  { name: "Webhooks", href: "/business-actor/webhooks", icon: Webhook },
  { name: "Chat", href: "/business-actor/chat", icon: MessagesSquare },
  { name: "Referrals", href: "/business-actor/referrals", icon: Share2 },
];
const customerNavigation = [
  /* ... */
  { name: "Dashboard", href: "/customer/dashboard", icon: LayoutGrid },
  { name: "Services", href: "/customer/services", icon: Briefcase },
  { name: "Invoices", href: "/customer/invoices", icon: FileText },
  { name: "My Bonus", href: "/customer/bonus", icon: HandCoins },
  { name: "Favorites", href: "/customer/favorites", icon: FolderHeart },
  { name: "Invite Friends", href: "/customer/invite", icon: Share2 },
  { name: "Chat", href: "/customer/chat", icon: MessagesSquare },
];
const superAdminNavigation = [
  /* ... */
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutGrid },
  { name: "Platforms", href: "/super-admin/platforms", icon: Server },
  {
    name: "Business Actors",
    href: "/super-admin/business-actors",
    icon: SuperAdminOrgIcon,
  },
  {
    name: "Customers",
    href: "/super-admin/customers",
    icon: SuperAdminUsersIcon,
  },
  { name: "Webhooks Config", href: "/super-admin/webhooks", icon: Webhook },
  { name: "Bonus Overview", href: "/super-admin/bonus", icon: HandCoins },
  { name: "Admin Comm.", href: "/super-admin/chat", icon: MessagesSquare },
];
const bottomNavigation = [
  { name: "Help & Support", href: "/help", icon: LifeBuoy },
  { name: "Settings", href: "/settings", icon: Settings },
];

let lastKnownRolePrefix = "/business-actor";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get active org context only if potentially a BA
  // This conditional hook usage is an anti-pattern. Instead, call hook always and use its data conditionally.
  // For simplicity here, we will use a flag based on pathname for now.
  const isBaPath = pathname.startsWith("/business-actor");
  const activeOrgContext = isBaPath ? useActiveOrganization() : null;
  const activeOrganizationId = activeOrgContext?.activeOrganizationId;

  useEffect(() => {
    if (pathname.startsWith("/business-actor"))
      lastKnownRolePrefix = "/business-actor";
    else if (pathname.startsWith("/customer"))
      lastKnownRolePrefix = "/customer";
    else if (pathname.startsWith("/super-admin"))
      lastKnownRolePrefix = "/super-admin";
  }, [pathname]);

  let sidebarTitle = "Dashboard";
  let logoSrc = "/logo.svg";
  let currentNavigation = customerNavigation;
  let activeRoleDashboardLink = "/customer/dashboard";

  if (lastKnownRolePrefix === "/business-actor") {
    sidebarTitle = "BA Workspace";
    currentNavigation = baNavigation;
    activeRoleDashboardLink = "/business-actor/dashboard";
  } else if (lastKnownRolePrefix === "/customer") {
    sidebarTitle = "My Account";
    currentNavigation = customerNavigation;
    activeRoleDashboardLink = "/customer/dashboard";
  } else if (lastKnownRolePrefix === "/super-admin") {
    sidebarTitle = "Platform Admin";
    currentNavigation = superAdminNavigation;
    activeRoleDashboardLink = "/super-admin/dashboard";
  }
  if (pathname === "/settings" || pathname === "/help") sidebarTitle = "Menu";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  type NavItemProps = {
    item: {
      name: string;
      href: string;
      icon: React.ElementType<{ className?: string }>;
      isOrgLink?: boolean;
    };
  };

  const NavItem = ({ item }: NavItemProps) => {
    let href = item.href;
    if (item.isOrgLink) {
      // Dynamically set href for "Manage Active Org"
      href = activeOrganizationId
        ? `/business-actor/organization/${activeOrganizationId}/profile`
        : "/business-actor/dashboard";
    }
    const isActive =
      pathname === href ||
      pathname.startsWith(href + "/") ||
      (href !== "/" &&
        href !== "/settings" &&
        href !== "/help" &&
        pathname.startsWith(href + "?"));
    return (
      /* ... NavItem JSX as before ... */
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors h-9",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
            onClick={() => isMobileOpen && setIsMobileOpen(false)}
          >
            <item.icon
              className={cn(
                "h-[18px] w-[18px] shrink-0",
                !isCollapsed && "mr-3"
              )}
            />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">{item.name}</TooltipContent>
        )}
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <>
        {" "}
        {/* Mobile Menu Toggle & Sidebar Container ... as before ... */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-[60] rounded-md shadow-md bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen",
            isCollapsed ? "w-[72px]" : "w-64",
            isMobileOpen
              ? "translate-x-0 shadow-xl"
              : "-translate-x-full lg:translate-x-0"
          )}
          data-collapsed={isCollapsed}
        >
          <div
            className={cn(
              "flex h-16 shrink-0 items-center border-b border-sidebar-border",
              isCollapsed ? "justify-center px-2" : "justify-between px-4"
            )}
          >
            <Link
              href={activeRoleDashboardLink}
              className={cn("flex items-center gap-2 font-semibold")}
              onClick={() => isMobileOpen && setIsMobileOpen(false)}
              aria-label={sidebarTitle}
            >
              <Image
                src={logoSrc}
                alt={`${sidebarTitle} Logo`}
                width={32}
                height={32}
                className="h-8 w-8 shrink-0"
                priority
              />
              {!isCollapsed && (
                <span className="text-lg truncate">{sidebarTitle}</span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden h-8 w-8 lg:flex",
                isCollapsed ? "" : "ml-auto"
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <SidebarClose
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
            {isMobileOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8 lg:hidden"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close Sidebar"
              >
                <SidebarClose className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Organization Switcher for BA */}
          {isBaPath &&
            !isCollapsed && ( // Show only for BA and when sidebar is expanded
              <OrganizationSwitcher />
            )}
          {isBaPath &&
            isCollapsed && ( // Show simplified org indicator when collapsed
              <div className="px-2 py-3 text-center border-b border-sidebar-border">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setIsCollapsed(false)}
                    >
                      <Building className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {activeOrgContext?.activeOrganizationDetails?.short_name ||
                      "Select Org"}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <nav
              className={cn(
                "flex-1 space-y-1 py-4",
                isCollapsed ? "px-2" : "px-4",
                isBaPath && "pt-0"
              )}
            >
              {" "}
              {/* Adjust padding if switcher is present */}
              {currentNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
            <div
              className={cn(
                "mt-auto border-t border-sidebar-border",
                isCollapsed ? "px-2" : "px-4"
              )}
            >
              <div className="space-y-1 py-4">
                {bottomNavigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
                {/* Logout Button ... as before ... */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-colors h-9",
                        "text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive",
                        isCollapsed ? "justify-center px-2" : "justify-start"
                      )}
                      onClick={() => {
                        handleLogout();
                        if (isMobileOpen) setIsMobileOpen(false);
                      }}
                    >
                      <LogOut
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          !isCollapsed && "mr-3"
                        )}
                      />
                      {!isCollapsed && <span className="truncate">Logout</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">Logout</TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-hidden="true"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </>
    </TooltipProvider>
  );
}
