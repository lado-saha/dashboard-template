// FILE: components/sidebar.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"; // Import Image component
import { usePathname } from "next/navigation"
import {
  Home, BarChart2, Building2, Users2, Briefcase, Folder, Wallet, Receipt,
  CreditCard, ShoppingCart, Calendar, Send, Star, Bell, Shield, Settings,
  MessagesSquare, Gift, HelpCircle, LogOut, Menu, SidebarClose, Users, Server
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
// Assuming useSettings might eventually provide role or org name/logo
// import { useSettings } from "@/contexts/settings-context";

// --- Navigation Arrays (keep as is) ---
const baNavigation = [
  { name: "Dashboard", href: "/business-actor/dashboard", icon: Home },
  { name: "Organization", href: "/business-actor/organization", icon: Building2 },
  { name: "Business", href: "/business-actor/business", icon: Briefcase },
  { name: "Transactions", href: "/business-actor/transactions", icon: Wallet },
  { name: "Invoices", href: "/business-actor/invoices", icon: Receipt },
  { name: "Wallet", href: "/business-actor/wallet", icon: Wallet }, // Portefeuille
  { name: "Bonus Config", href: "/business-actor/bonus", icon: Star },
  { name: "Webhooks", href: "/business-actor/webhooks", icon: Bell },
  { name: "Chat", href: "/business-actor/chat", icon: MessagesSquare },
  // Add other BA sections from spec...
  { name: "Wishlist", href: "/business-actor/wishlist", icon: ShoppingCart },
  { name: "Planning", href: "/business-actor/planning", icon: Calendar },
  { name: "Posts", href: "/business-actor/posts", icon: Send },
  { name: "Reservations", href: "/business-actor/reservations", icon: Calendar }, // Example
  { name: "Payments", href: "/business-actor/payments", icon: CreditCard },
  { name: "Subscription", href: "/business-actor/subscription", icon: Receipt }, // Example
  { name: "Referrals", href: "/business-actor/referrals", icon: Gift },
  { name: "Reviews", href: "/business-actor/reviews", icon: Star }, // Example
];

const customerNavigation = [
  { name: "Dashboard", href: "/customer/dashboard", icon: Home },
  { name: "Services", href: "/customer/services", icon: Briefcase }, // Announcements/Reservations
  { name: "Invoices", href: "/customer/invoices", icon: Receipt },
  { name: "My Bonus", href: "/customer/bonus", icon: Star },
  { name: "Favorites", href: "/customer/favorites", icon: Star }, // Example
  { name: "Invite Friends", href: "/customer/invite", icon: Gift },
  { name: "Chat", href: "/customer/chat", icon: MessagesSquare },
  // Add other Customer sections...
];

const superAdminNavigation = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: Home },
  { name: "Platforms", href: "/super-admin/platforms", icon: Server },
  { name: "Business Actors", href: "/super-admin/business-actors", icon: Users2 },
  { name: "Customers", href: "/super-admin/customers", icon: Users },
  { name: "Webhooks Config", href: "/super-admin/webhooks", icon: Bell },
  { name: "Bonus Overview", href: "/super-admin/bonus", icon: Star },
  { name: "Chat", href: "/super-admin/chat", icon: MessagesSquare },
  // Add other Super Admin sections...
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // const { settings } = useSettings(); // Uncomment and use if needed for logo/title

  // --- Role Determination Logic (keep as is) ---
  let userRole = 'business-actor';
  let sidebarTitle = "BA Workspace";
  let logoSrc = "/logo.svg";
  let currentNavigation = baNavigation;
  let settingsHrefPrefix = "/business-actor";

  if (pathname.startsWith('/customer')) {
    userRole = 'customer';
    sidebarTitle = "My Account";
    currentNavigation = customerNavigation;
    settingsHrefPrefix = "/customer";
  } else if (pathname.startsWith('/super-admin')) {
    userRole = 'super-admin';
    sidebarTitle = "Platform Admin";
    currentNavigation = superAdminNavigation;
    settingsHrefPrefix = "/super-admin";
  } else if (pathname.startsWith('/business-actor')) {
    currentNavigation = baNavigation;
    settingsHrefPrefix = "/business-actor";
  }
  // --- End Role Determination ---

  // --- NavItem Component (keep as is) ---
  type NavItemProps = {
    item: {
      name: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    };
    isBottom?: boolean;
  };

  const NavItem = ({ item, isBottom = false }: NavItemProps) => {
    let href = item.href;

    if (isBottom && (item.name === "Settings" || item.name === "Help")) {
      // Assuming shared settings/help pages at root level
      href = item.href;
    } else if (isBottom && item.name !== "Logout") {
      // Prefix other bottom links if they exist and are role-specific
      href = `${settingsHrefPrefix}${item.href}`;
    } else if (item.name === "Logout") {
      // Keep logout generic if needed
      href = item.href;
    }
    // No change needed for main navigation items (top section)

    const isActive = pathname === href || (href !== '/' && href !== '/logout' && href !== '/settings' && href !== '/help' && pathname.startsWith(href));

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground" // Use sidebar theme colors
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed && "justify-center px-2 h-9", // Adjust height for collapsed consistency
            )}
            onClick={() => isMobileOpen && setIsMobileOpen(false)}
          >
            <item.icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} /> {/* Slightly larger icon */}
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="flex items-center gap-4">
            {item.name}
          </TooltipContent>
        )}
      </Tooltip>
    );
  };
  // --- End NavItem Component ---

  return (
    <TooltipProvider>
      <>
        {/* Mobile Menu Toggle (keep as is) */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-50 rounded-md shadow-md"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Sidebar Container (keep as is) */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen",
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0",
          )}
          data-collapsed={isCollapsed} // Add data attribute for potential CSS targeting
        >
          {/* === Modified Sidebar Header === */}
          <div className={cn(
            "flex h-16 shrink-0 items-center border-b border-sidebar-border",
            isCollapsed ? "justify-center px-2" : "justify-between px-4" // Adjust padding and justification
          )}>
            {/* Logo/Title Link */}
            <Link
              href={settingsHrefPrefix + "/dashboard"}
              className={cn(
                "flex items-center gap-2 font-semibold",
                // Remove justification from here, handle padding/spacing via parent
              )}
              onClick={() => isMobileOpen && setIsMobileOpen(false)}
              aria-label={sidebarTitle} // Add aria-label for accessibility when title hidden
            >
              <Image
                src={logoSrc}
                alt={`${sidebarTitle} Logo`}
                width={32}
                height={32}
                className="h-8 w-8 shrink-0" // Logo is always visible
                priority
              />
              {!isCollapsed && (
                <span className="text-lg truncate">{sidebarTitle}</span> // Title hidden when collapsed
              )}
            </Link>

            {/* --- Desktop Collapse/Expand Button --- */}
            {/* Always rendered on desktop, position handled by parent flex */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hidden h-8 w-8 lg:flex",
                isCollapsed ? "" : "ml-auto" // Only add margin when expanded
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <SidebarClose className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>


            {/* --- Mobile Close Button (inside header when mobile open) --- */}
            {/* This should only really be visible when isMobileOpen is true */}
            {isMobileOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8 lg:hidden" // Ensures it's hidden on desktop
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close Sidebar"
              >
                <SidebarClose className="h-4 w-4" />
              </Button>
            )}
          </div>
          {/* === End Modified Sidebar Header === */}


          {/* Navigation Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Add padding matching header when collapsed */}
            <nav className={cn("flex-1 space-y-1 py-4", isCollapsed ? "px-2" : "px-4")}>
              {currentNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>


        </div>

        {/* Overlay for mobile (keep as is) */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            aria-hidden="true"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </>
    </TooltipProvider>
  );
}