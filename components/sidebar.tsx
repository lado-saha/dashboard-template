"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image";
import { usePathname } from "next/navigation"
import {
  Home, BarChart2, Building2, Users2, Briefcase, Folder, Wallet, Receipt,
  CreditCard, ShoppingCart, Calendar, Send, Star, Bell, Shield, Settings,
  MessagesSquare, Gift, HelpCircle, LogOut, Menu, SidebarClose, Users, Server,
  FileText, // Added for Invoices
  LifeBuoy, // Added for Help
  UserCog, // Added for Profile/Settings link clearer icon
  Webhook, // Added for Webhooks clearer icon
  Ticket, // Added for Reservations clearer icon
  Tag, // Added for Products clearer icon
  UsersRound, // Added for Personnel clearer icon
  Share2, // Added for Invite/Referrals clearer icon
  LayoutGrid, // Added for general Dashboard clearer icon
  FolderHeart, // Added for Favorites clearer icon
  ListChecks, // Added for Wishlist clearer icon
  CalendarClock, // Added for Planning clearer icon
  Newspaper, // Added for Posts clearer icon
  HandCoins,
  Package, // Added for Bonus clearer icon
} from "lucide-react"
import { signOut } from "next-auth/react"; // Import signOut

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"; // Import Separator

// --- Navigation Arrays (Updated based on file structure & spec) ---
const baNavigation = [
  { name: "Dashboard", href: "/business-actor/dashboard", icon: LayoutGrid },
  {
    name: "Organization", href: "/business-actor/organization", icon: Building2,
    subItems: [ // Example: Add sub-items if needed later for better organization
      { name: "Analytics", href: "/business-actor/organization?tab=analytics", icon: BarChart2 },
      { name: "Headquarter", href: "/business-actor/organization?tab=headquarter", icon: Building2 },
      { name: "Personnel", href: "/business-actor/organization?tab=personnel", icon: UsersRound },
      { name: "Agencies", href: "/business-actor/organization?tab=agencies", icon: Users2 },
      { name: "Products", href: "/business-actor/organization?tab=products", icon: Tag },
    ]
  },
  { name: "Products", href: "/business-actor/products", icon: Package }, // Product ma
  { name: "Business", href: "/business-actor/business", icon: Briefcase }, // General Business Ops
  { name: "Transactions", href: "/business-actor/transactions", icon: Receipt }, // Sales focused
  { name: "Invoices", href: "/business-actor/invoices", icon: FileText },
  { name: "Reservations", href: "/business-actor/reservations", icon: Ticket },
  { name: "Payments", href: "/business-actor/payments", icon: CreditCard },
  { name: "Subscription", href: "/business-actor/subscription", icon: Star }, // Pricing Plan/Usage/Limits
  { name: "Wallet", href: "/business-actor/wallet", icon: Wallet }, // Portefeuille
  { name: "Bonus Config", href: "/business-actor/bonus", icon: HandCoins },
  { name: "Webhooks", href: "/business-actor/webhooks", icon: Webhook },
  { name: "Wishlist", href: "/business-actor/wishlist", icon: ListChecks },
  { name: "Planning", href: "/business-actor/planning", icon: CalendarClock },
  { name: "Posts", href: "/business-actor/posts", icon: Newspaper },
  { name: "Chat", href: "/business-actor/chat", icon: MessagesSquare },
  { name: "Referrals", href: "/business-actor/referrals", icon: Share2 },
  { name: "Reviews", href: "/business-actor/reviews", icon: Star },
];

const customerNavigation = [
  { name: "Dashboard", href: "/customer/dashboard", icon: LayoutGrid },
  { name: "Services", href: "/customer/services", icon: Briefcase }, // Announcements/Offers & Transactions/Wishlist
  { name: "Invoices", href: "/customer/invoices", icon: FileText },
  { name: "My Bonus", href: "/customer/bonus", icon: HandCoins },
  { name: "Favorites", href: "/customer/favorites", icon: FolderHeart },
  { name: "Invite Friends", href: "/customer/invite", icon: Share2 }, // Referrals page
  { name: "Chat", href: "/customer/chat", icon: MessagesSquare },
];

const superAdminNavigation = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutGrid },
  { name: "Platforms", href: "/super-admin/platforms", icon: Server },
  { name: "Business Actors", href: "/super-admin/business-actors", icon: Building2 }, // Changed icon
  { name: "Customers", href: "/super-admin/customers", icon: Users },
  { name: "Webhooks Config", href: "/super-admin/webhooks", icon: Webhook },
  { name: "Bonus Overview", href: "/super-admin/bonus", icon: HandCoins },
  { name: "Admin Comm.", href: "/super-admin/chat", icon: MessagesSquare }, // Renamed for clarity
  // Super Admin Profile/Settings handled by bottom nav
];

// --- Bottom Navigation (Common) ---
const bottomNavigation = [
  { name: "Help & Support", href: "/help", icon: LifeBuoy }, // Example: Shared help page
  { name: "Settings", href: "/settings", icon: Settings }, // Shared settings page link
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- Role Determination Logic ---
  let userRole = 'business-actor'; // Default assumption
  let sidebarTitle = "BA Workspace";
  let logoSrc = "/logo.svg"; // Consider making this dynamic based on role/org if needed
  let currentNavigation = baNavigation;
  let settingsHrefPrefix = "/business-actor"; // Base path for role-specific pages

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
    userRole = 'business-actor';
    sidebarTitle = "BA Workspace";
    currentNavigation = baNavigation;
    settingsHrefPrefix = "/business-actor";
  } else {
    // Handle cases like /settings, /help, or unexpected paths
    // Try to infer from the last known good path or use a default
    // This part might need refinement based on how shared pages are handled
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && ['settings', 'help'].includes(segments[0])) {
      // If on a shared page, try to guess the role from referer or session? Or keep previous role?
      // For now, let's default to BA if path is ambiguous but not auth/landing
      userRole = 'business-actor';
      sidebarTitle = "BA Workspace";
      currentNavigation = baNavigation;
      settingsHrefPrefix = "/business-actor";
      console.warn("Sidebar: Ambiguous path, defaulting role display to Business Actor.");
    }
  }
  // --- End Role Determination ---

  // --- Logout Handler ---
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' }); // Redirect to login after sign out
  };
  // --- End Logout Handler ---


  // --- NavItem Component ---
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

    // Adjust href based on context (bottom nav vs main nav)
    // Assumption: Settings is now a shared page at /settings
    // Assumption: Help is now a shared page at /help
    if (isBottom && (item.name === "Settings" || item.name === "Help & Support")) {
      // Keep the direct path for shared pages
      href = item.href;
    } else if (!isBottom) {
      // Main navigation items use the auto-detected prefix from their definition
      href = item.href; // Href should already include the role prefix
    }
    // else: Handle potential future role-specific bottom links if needed

    const isActive = pathname === href || pathname.startsWith(href + '/') || (item.href !== '/' && pathname.startsWith(item.href + '?')); // Improved active check

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors h-9", // Consistent height
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground", // Subtle hover
              isCollapsed && "justify-center px-2",
            )}
            onClick={() => isMobileOpen && setIsMobileOpen(false)}
          >
            <item.icon className={cn("h-[18px] w-[18px] shrink-0", !isCollapsed && "mr-3")} /> {/* Slightly adjusted icon size */}
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
        {/* Mobile Menu Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-[60] rounded-md shadow-md bg-background/80 backdrop-blur-sm" // Ensure high z-index
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Sidebar Container */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen",
            isCollapsed ? "w-[72px]" : "w-64", // Slightly narrower width when expanded
            isMobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0",
          )}
          data-collapsed={isCollapsed}
        >
          {/* Sidebar Header */}
          <div className={cn(
            "flex h-16 shrink-0 items-center border-b border-sidebar-border",
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}>
            <Link
              href={`${settingsHrefPrefix}/dashboard`} // Links to role-specific dashboard
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

            {/* Desktop Collapse/Expand Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("hidden h-8 w-8 lg:flex", isCollapsed ? "" : "ml-auto")}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <SidebarClose className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>

            {/* Mobile Close Button */}
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

          {/* Main Navigation Area */}
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <nav className={cn("flex-1 space-y-1 py-4", isCollapsed ? "px-2" : "px-4")}>
              {currentNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>

            {/* Bottom Navigation Area */}
            <div className={cn("mt-auto border-t border-sidebar-border", isCollapsed ? "px-2" : "px-4")}>
              {/* <Separator className={cn("my-2", isCollapsed ? "-mx-2" : "-mx-4")} /> Visual separator */}
              <div className="space-y-1 py-4">
                {bottomNavigation.map((item) => (
                  // Use the correct settingsHrefPrefix for Settings link
                  <NavItem key={item.name} item={{ ...item, href: item.name === 'Settings' ? `${settingsHrefPrefix}/settings` : item.href }} isBottom />
                ))}
                {/* Logout Button */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost" // Use ghost variant for less emphasis
                      className={cn(
                        "flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-colors h-9",
                        "text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive", // Destructive hover
                        isCollapsed ? "justify-center px-2" : "justify-start",
                      )}
                      onClick={() => {
                        handleLogout();
                        if (isMobileOpen) setIsMobileOpen(false);
                      }}
                    >
                      <LogOut className={cn("h-[18px] w-[18px] shrink-0", !isCollapsed && "mr-3")} />
                      {!isCollapsed && <span className="truncate">Logout</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="flex items-center gap-4">
                      Logout
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden" // Ensure z-index is below sidebar but above content
            aria-hidden="true"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </>
    </TooltipProvider>
  );
}