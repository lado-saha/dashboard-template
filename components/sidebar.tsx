"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart2,
  Building2,
  Users2,
  Briefcase,
  Wallet,
  Receipt,
  CreditCard,
  Star,
  Settings,
  MessagesSquare,
  Gift,
  LogOut,
  Menu,
  SidebarClose,
  Users,
  Server,
  FileText,
  LifeBuoy,
  Webhook,
  Ticket,
  Tag,
  UsersRound,
  Share2,
  LayoutGrid,
  FolderHeart,
  ListChecks,
  CalendarClock,
  Newspaper,
  HandCoins,
  Package,
  Landmark, // Added Landmark for general Organization
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

// BA Navigation - Assuming My Organization is now a top-level item
const baNavigation = [
  { name: "Dashboard", href: "/business-actor/dashboard", icon: LayoutGrid },
  {
    name: "My Organization(s)",
    href: "/business-actor/organization-hub",
    icon: Landmark,
  }, // New top-level hub
  // Products, Agencies, Personnel will be under a selected organization via /[orgId]/...
  { name: "Wallet", href: "/business-actor/wallet", icon: Wallet },
  { name: "Bonus Config", href: "/business-actor/bonus", icon: HandCoins },
  { name: "Webhooks", href: "/business-actor/webhooks", icon: Webhook },
  { name: "Chat", href: "/business-actor/chat", icon: MessagesSquare },
  { name: "Referrals", href: "/business-actor/referrals", icon: Share2 },
];

const customerNavigation = [
  /* ... same as before ... */
  { name: "Dashboard", href: "/customer/dashboard", icon: LayoutGrid },
  { name: "Services", href: "/customer/services", icon: Briefcase },
  { name: "Invoices", href: "/customer/invoices", icon: FileText },
  { name: "My Bonus", href: "/customer/bonus", icon: HandCoins },
  { name: "Favorites", href: "/customer/favorites", icon: FolderHeart },
  { name: "Invite Friends", href: "/customer/invite", icon: Share2 },
  { name: "Chat", href: "/customer/chat", icon: MessagesSquare },
];

const superAdminNavigation = [
  /* ... same as before ... */
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutGrid },
  { name: "Platforms", href: "/super-admin/platforms", icon: Server },
  {
    name: "Business Actors",
    href: "/super-admin/business-actors",
    icon: Building2,
  },
  { name: "Customers", href: "/super-admin/customers", icon: Users },
  { name: "Webhooks Config", href: "/super-admin/webhooks", icon: Webhook },
  { name: "Bonus Overview", href: "/super-admin/bonus", icon: HandCoins },
  { name: "Admin Comm.", href: "/super-admin/chat", icon: MessagesSquare },
];

const bottomNavigation = [
  { name: "Help & Support", href: "/help", icon: LifeBuoy },
  { name: "Settings", href: "/settings", icon: Settings }, // Unified settings link
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  let sidebarTitle = "Dashboard";
  let logoSrc = "/logo.svg";
  let currentNavigation = customerNavigation; // Default to customer if role unknown
  let roleSpecificBase = "/customer"; // For logo link if needed

  if (pathname.startsWith("/business-actor")) {
    sidebarTitle = "BA Workspace";
    currentNavigation = baNavigation;
    roleSpecificBase = "/business-actor";
  } else if (pathname.startsWith("/customer")) {
    sidebarTitle = "My Account";
    currentNavigation = customerNavigation;
    roleSpecificBase = "/customer";
  } else if (pathname.startsWith("/super-admin")) {
    sidebarTitle = "Platform Admin";
    currentNavigation = superAdminNavigation;
    roleSpecificBase = "/super-admin";
  } else if (pathname.startsWith("/settings") || pathname.startsWith("/help")) {
    // If on shared page, try to keep context of last known role or default
    // For now, let's use a generic title or try to infer.
    // This part is tricky without session-based role. For now, assume currentNavigation
    // might be based on a previous path or a default.
    sidebarTitle = "Menu"; // Generic for shared pages
    // Infer last role from referrer or a more sophisticated context if available
    // For now, BA nav might show by default if no clear context from path
    const segments = pathname.split("/");
    // Heuristic: If coming from a role-specific dashboard to /settings
    if (typeof window !== "undefined" && document.referrer) {
      if (document.referrer.includes("/business-actor"))
        currentNavigation = baNavigation;
      else if (document.referrer.includes("/customer"))
        currentNavigation = customerNavigation;
      else if (document.referrer.includes("/super-admin"))
        currentNavigation = superAdminNavigation;
      else currentNavigation = []; // Or a minimal shared nav
    } else {
      currentNavigation = []; // No specific nav for general settings/help page view
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  type NavItemProps = {
    item: {
      name: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    };
    isBottom?: boolean;
  };

  const NavItem = ({ item }: NavItemProps) => {
    const isActive =
      pathname === item.href ||
      pathname.startsWith(item.href + "/") ||
      (item.href !== "/" &&
        item.href !== "/settings" &&
        item.href !== "/help" &&
        pathname.startsWith(item.href + "?"));
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href} // Direct href, as they are now absolute
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
              "flex h-12 shrink-0 items-center border-b border-sidebar-border",
              isCollapsed ? "justify-center px-2" : "justify-between px-4"
            )}
          >
            <Link
              href={`${roleSpecificBase}/dashboard`}
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
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <nav
              className={cn(
                "flex-1 space-y-1 py-4",
                isCollapsed ? "px-2" : "px-4"
              )}
            >
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
