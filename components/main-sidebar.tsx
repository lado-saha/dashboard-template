"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Award,
  Briefcase,
  Building,
  Combine,
  FileText,
  FolderHeart,
  HandCoins,
  HelpCircle,
  ImageIcon as ImageIconLucide,
  Info,
  LayoutGrid,
  Lightbulb,
  LogOut,
  Landmark,
  Menu,
  MessagesSquare,
  Package,
  Server,
  Settings,
  Share2,
  SidebarClose,
  Truck,
  UserCheck,
  Users,
  Users2,
  UsersRound,
  Wallet,
  Webhook,
  ArrowRight,
  ArrowLeft,
  UserCog,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OrganizationSwitcher } from "@/components/organization/organization-switcher";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Separator } from "./ui/separator";
import { AgencySwitcher } from "./organization/agencies/agency-switcher";

// --- UPDATED NAVIGATION ARRAYS ---
const baOrgNavigation = [
  {
    name: "Dashboard",
    href: "/business-actor/dashboard",
    icon: LayoutGrid,
    isOrgSpecific: false,
  },
  {
    name: "Org. Profile",
    href: "/business-actor/org/profile",
    icon: Landmark,
    isOrgSpecific: true,
  },
  {
    name: "Agencies",
    href: "/business-actor/org/agencies",
    icon: Users2,
    isOrgSpecific: true,
  },
  {
    name: "Employees",
    href: "/business-actor/org/employees",
    icon: Users,
    isOrgSpecific: true,
  },
  {
    name: "Products",
    href: "/business-actor/org/products",
    icon: Package,
    isOrgSpecific: true,
  },
  {
    name: "Services",
    href: "/business-actor/org/services",
    icon: Combine,
    isOrgSpecific: true,
  },
  {
    name: "Certifications",
    href: "/business-actor/org/certifications",
    icon: Award,
    isOrgSpecific: true,
  },
  {
    name: "Practical Info",
    href: "/business-actor/org/practical-info",
    icon: Info,
    isOrgSpecific: true,
  },
];
const agencyNavigation = [
  {
    name: "Agency Dashboard",
    href: "/business-actor/agency/dashboard",
    icon: LayoutGrid,
  },
  {
    name: "Agency Profile",
    href: "/business-actor/agency/profile",
    icon: Landmark,
  },
  {
    name: "Agency Employees",
    href: "/business-actor/agency/employees",
    icon: Users,
  },
  {
    name: "Agency Customers",
    href: "/business-actor/agency/customers",
    icon: UsersRound,
  },
];
const baGlobalNavigation = [
  { name: "My BA Profile", href: "/business-actor/profile", icon: UserCog },
  { name: "Wallet", href: "/business-actor/wallet", icon: Wallet },
  { name: "Bonus Config", href: "/business-actor/bonus", icon: HandCoins },
];
const userNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Services", href: "/services", icon: Briefcase },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "My Bonus", href: "/bonus", icon: HandCoins },
  { name: "Favorites", href: "/favorites", icon: FolderHeart },
  { name: "Invite Friends", href: "/invite", icon: Share2 },
  { name: "Chat", href: "/chat", icon: MessagesSquare },
];
const superAdminNavigation = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutGrid },
  {
    name: "Business Actors",
    href: "/super-admin/business-actors",
    icon: Building,
  },
  { name: "Customers", href: "/super-admin/customers", icon: Users },
];
const bottomNavigation = [
  { name: "Help & Support", href: "/help", icon: HelpCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { activeOrganizationId, activeAgencyDetails } = useActiveOrganization();

  const isBusinessActor = !!session?.user.businessActorId;
  const isSuperAdminContext = pathname.startsWith("/super-admin");
  const isAgencyContext = pathname.startsWith("/business-actor/agency");
  const isOrgContext =
    !isAgencyContext && pathname.startsWith("/business-actor"); // Simplified this logic
  const isUserContext = !isBusinessActor;

  // --- Determine current navigation context ---
  let mainNav: any[] = [];
  let globalNav: any[] = [];
  let sidebarTitle = "My Account";
  let homeLink = "/dashboard";
  let ContextSwitcher = null;
  let ContextExitButton = null;

  if (isSuperAdminContext) {
    mainNav = superAdminNavigation;
    sidebarTitle = "Platform Admin";
    homeLink = "/super-admin/dashboard";
  } else if (isAgencyContext) {
    mainNav = agencyNavigation;
    sidebarTitle = activeAgencyDetails?.short_name || "Agency";
    homeLink = "/business-actor/agency/dashboard";
    ContextSwitcher = () => <AgencySwitcher isCollapsed={isCollapsed} />;
    ContextExitButton = () => (
      <Button
        onClick={() => router.push("/business-actor/dashboard")}
        variant="ghost"
        className="w-full justify-start h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <ArrowLeft
          className={cn("h-[18px] w-[18px]", !isCollapsed && "mr-3")}
        />
        {!isCollapsed && "Exit Agency"}
      </Button>
    );
  } else if (isOrgContext) {
    mainNav = baOrgNavigation;
    globalNav = baGlobalNavigation;
    sidebarTitle = "BA Workspace";
    homeLink = "/business-actor/dashboard";
    ContextSwitcher = () => <OrganizationSwitcher isCollapsed={isCollapsed} />;
  } else {
    // User context
    mainNav = userNavigation;
  }

  const handleLogout = async () => await signOut({ callbackUrl: "/login" });

  const NavItem = ({
    item,
  }: {
    item: {
      name: string;
      href: string;
      icon: React.ElementType;
      isOrgSpecific?: boolean;
    };
  }) => {
    const isDisabled = item.isOrgSpecific && !activeOrganizationId;
    const finalHref = isDisabled ? "#" : item.href;
    const isActive = !isDisabled && pathname.startsWith(finalHref);

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={finalHref}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors h-9",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/80",
              isDisabled && "cursor-not-allowed text-muted-foreground/50",
              isCollapsed && "justify-center px-2"
            )}
            onClick={() =>
              isMobileOpen && !isDisabled && setIsMobileOpen(false)
            }
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
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-[60]"
        onClick={() => setIsMobileOpen((v) => !v)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div
        className={cn(
          " fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen",
          isCollapsed ? "w-[72px] items-center" : "w-64",
          isMobileOpen
            ? "translate-x-0 shadow-xl"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* --- HEADER --- */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b px-4",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Link
            href={homeLink}
            className="flex items-center gap-2 font-semibold"
          >
            <Image
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              priority
              className="shrink-0"
            />
            {!isCollapsed && (
              <span className="text-lg truncate">{sidebarTitle}</span>
            )}
          </Link>

          {/* THE FIX: Collapse and Expand buttons now correctly toggle state */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-auto hidden lg:flex"
              onClick={() => setIsCollapsed(true)}
            >
              <SidebarClose className="h-4 w-4" />
            </Button>
          )}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-auto hidden lg:flex"
              onClick={() => setIsCollapsed(false)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {isMobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-auto lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <SidebarClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div>
          {ContextSwitcher && <ContextSwitcher />}
          <Separator className="my-2 w-full bg-border/60" />
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <nav
            className={cn(
              "flex-1 space-y-1 py-4",
              isCollapsed ? "px-2" : "px-4"
            )}
          >
            {/* Main Navigation */}
            {mainNav.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}

            {/* Global BA Navigation (if applicable) */}
            {globalNav.length > 0 && (
              <>
                <Separator className="my-3 bg-border/60" />
                {globalNav.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </>
            )}

            {/* "Enter BA Workspace" button for regular users */}
            {isOrgContext && (
              <>
                <Separator className="my-3" />
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => router.push("/dashboard")}
                      variant="ghost"
                      className="group relative flex items-center w-full justify-start h-9 px-3 text-red-500 hover:text-red-600 hover:bg-primary/10"
                    >
                      <ArrowLeft
                        className={cn(
                          "h-[18px] w-[18px] transition-transform group-hover:translate-x-1",
                          !isCollapsed && "mr-3"
                        )}
                      />
                      {!isCollapsed && "Exit BA Workspace"}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      Exit BA Workspace
                    </TooltipContent>
                  )}
                </Tooltip>
              </>
            )}
          </nav>

          {/* --- BOTTOM NAVIGATION --- */}
          <div
            className={cn(
              "mt-auto border-t border-sidebar-border px-4",
              isCollapsed && "px-2"
            )}
          >
            <div className="space-y-1 py-4">
              {ContextExitButton && <ContextExitButton />}
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="flex items-center w-full justify-start h-9 px-3 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut
                      className={cn(
                        "h-[18px] w-[18px]",
                        !isCollapsed && "mr-3"
                      )}
                    />
                    {!isCollapsed && "Logout"}
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
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </TooltipProvider>
  );
}
