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

// --- Navigation Arrays (routes updated) ---
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
  // { name: "Wishlist", href: "/business-actor/wishlist", icon: ShoppingCart },
  // { name: "Planning", href: "/business-actor/planning", icon: Calendar },
  // { name: "Posts", href: "/business-actor/posts", icon: Send },
  // { name: "Reservations", href: "/business-actor/reservations", icon: Calendar }, // Example
  // { name: "Payments", href: "/business-actor/payments", icon: CreditCard },
  // { name: "Subscription", href: "/business-actor/subscription", icon: Receipt }, // Example
  // { name: "Referrals", href: "/business-actor/referrals", icon: Gift },
  // { name: "Reviews", href: "/business-actor/reviews", icon: Star }, // Example
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

const bottomNavigation = [
  // Update hrefs to be placeholders, logic will add prefix later
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Logout", href: "/logout", icon: LogOut }, // Logout usually doesn't need prefix
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // const { settings } = useSettings(); // To get BA name, logo etc.

  // --- Determine Role and Content ---
  // This logic needs to be replaced with your actual auth/context system
  let userRole = 'business-actor'; // Default for example
  let sidebarTitle = "BA Workspace"; // Default Title
  let logoSrc = "/logo.svg"; // Default Logo
  let currentNavigation = baNavigation;
  let settingsHrefPrefix = "/business-actor";

  if (pathname.startsWith('/customer')) {
    userRole = 'customer';
    sidebarTitle = "My Account";
    // logoSrc = settings.customerLogo || "/default-customer-logo.svg"; // Example dynamic logo
    currentNavigation = customerNavigation;
    settingsHrefPrefix = "/customer";
  } else if (pathname.startsWith('/super-admin')) {
    userRole = 'super-admin';
    sidebarTitle = "Platform Admin";
    // logoSrc = "/admin-logo.svg"; // Example admin logo
    currentNavigation = superAdminNavigation;
    settingsHrefPrefix = "/super-admin";
  } else if (pathname.startsWith('/business-actor')) {
    // You might get specific BA name/logo from settings context
    // sidebarTitle = settings.organizationName || "BA Workspace";
    // logoSrc = settings.organizationLogo || "/logo.svg";
    currentNavigation = baNavigation; // Already default, but explicit
    settingsHrefPrefix = "/business-actor";
  }
  // --- End Role Determination ---


  const NavItem = ({ item, isBottom = false }) => {
    let href = item.href;

    // Add role prefix to bottom nav items like Settings and Help
    // Logout typically goes to a generic /logout route
    if (isBottom && item.name !== "Logout") {
      // Handle the case where the base settings/help page is shared (/settings)
      // Or if they are role-specific (/business-actor/settings)
      // This example assumes role-specific URLs generated from the prefix:
      href = `${settingsHrefPrefix}${item.href}`;
    }

    // If you decide settings IS shared at /settings, adjust here:
    // if (isBottom && (item.name === "Settings" || item.name === "Help")) {
    //   href = item.href; // Keep it as /settings or /help
    // } else if (isBottom && item.name !== "Logout") {
    //   href = `${settingsHrefPrefix}${item.href}`; // Prefix other bottom links if any
    // }

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              (pathname === href || (href !== '/' && pathname.startsWith(href)))
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
              isCollapsed && "justify-center px-2",
            )}
            onClick={() => isMobileOpen && setIsMobileOpen(false)} // Close mobile sidebar on nav
          >
            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{item.name}</span>}
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

  return (
    <TooltipProvider>
      <>
        {/* Mobile Menu Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-50 rounded-md shadow-md" // Use Button for consistency
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Sidebar Container */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen", // Use theme vars, sticky position
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0", // Add shadow when mobile open
          )}
        >
          {/* Sidebar Header */}
          <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
            <Link
              href={settingsHrefPrefix + "/dashboard"} // Link logo/title to role's dashboard
              className={cn("flex items-center gap-2 font-semibold", isCollapsed && "justify-center w-full")}
              onClick={() => isMobileOpen && setIsMobileOpen(false)} // Close mobile sidebar on click
            >
              <Image
                src={logoSrc} // Dynamic logo source
                alt={`${sidebarTitle} Logo`}
                width={32} // Adjust size as needed
                height={32}
                className="h-8 w-8 shrink-0" // Tailwind size control
                priority // Prioritize logo loading
              />
              {!isCollapsed && (
                <span className="text-lg truncate">{sidebarTitle}</span> // Dynamic title
              )}
            </Link>

            {/* Desktop Collapse Button */}
            <Button
              variant="ghost"
              size="icon" // Use icon size
              className={cn("ml-auto hidden h-8 w-8 lg:flex", isCollapsed && "ml-0")}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <SidebarClose className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>

            {/* Mobile Close Button (appears inside header when open) */}
            <Button
              variant="ghost"
              size="icon" // Use icon size
              className="ml-auto h-8 w-8 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close Sidebar"
            >
              <SidebarClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {currentNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-auto border-t border-sidebar-border p-2">
            <nav className="space-y-1">
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} isBottom />
              ))}
            </nav>
          </div>
        </div>

        {/* Overlay for mobile */}
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