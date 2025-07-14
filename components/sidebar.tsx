"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Award,
  Briefcase,
  Building,
  Combine,
  FileText,
  FolderHeart,
  HandCoins,
  HelpCircle,
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
  ArrowLeft,
  UserCog,
  Power,
  Shield,
  Info,
} from "lucide-react";
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
import { toast } from "sonner";

// --- Navigation Definitions ---

const userNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "My Bonus", href: "/bonus", icon: HandCoins },
  { name: "Favorites", href: "/favorites", icon: FolderHeart },
];

const baOrgNavigation = [
  {
    name: "Org. Dashboard",
    href: "/business-actor/dashboard",
    icon: LayoutGrid,
    isOrgSpecific: true,
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
  {
    name: "Organizations Hub",
    href: "/business-actor/organizations",
    icon: Building,
  },
  { name: "My BA Profile", href: "/business-actor/profile", icon: UserCog },
  { name: "API & Webhooks", href: "/business-actor/webhooks", icon: Webhook },
];

const superAdminNavigation = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutGrid },
  { name: "User Management", href: "/super-admin/users", icon: Users },
  { name: "Roles & Permissions", href: "/super-admin/roles", icon: Shield },
  {
    name: "Organization Mgmt",
    href: "/super-admin/organizations",
    icon: Building,
  },
  { name: "Global Agencies", href: "/super-admin/agencies", icon: Users2 },
  {
    name: "Global Customers",
    href: "/super-admin/customers",
    icon: UsersRound,
  },
  { name: "Global Suppliers", href: "/super-admin/suppliers", icon: Truck },
  {
    name: "Global Certifications",
    href: "/super-admin/certifications",
    icon: Award,
  },
  {
    name: "Business Domains",
    href: "/super-admin/business-domains",
    icon: Server,
  },
];

const bottomNavigation = [
  { name: "Help & Support", href: "/help", icon: HelpCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const {
    activeOrganizationId,
    activeAgencyDetails,
    clearActiveAgency,
    clearActiveOrganization,
  } = useActiveOrganization();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { isBusinessActor, isSuperAdmin } = useMemo(
    () => ({
      isBusinessActor: !!session?.user.businessActorId,
      isSuperAdmin: true,
    }),
    [session]
  );

  const isAgencyContext = pathname.startsWith("/business-actor/agency");

  let mainNav: any[] = userNavigation;
  let globalNav: any[] = [];
  let sidebarTitle = "My Account";
  let homeLink = "/dashboard";
  let ContextSwitcher = null;

  if (isSuperAdmin && pathname.startsWith("/super-admin/") ) {
    mainNav = superAdminNavigation;
    sidebarTitle = "Platform Admin";
    homeLink = "/super-admin/dashboard";
  } else if (isBusinessActor) {
    if (isAgencyContext) {
      mainNav = agencyNavigation;
      sidebarTitle = activeAgencyDetails?.short_name || "Agency";
      homeLink = "/business-actor/agency/dashboard";
      ContextSwitcher = () => <AgencySwitcher isCollapsed={isCollapsed} />;
    } else {
      mainNav = baOrgNavigation;
      globalNav = baGlobalNavigation;
      sidebarTitle = "BA Workspace";
      homeLink = "/business-actor/organizations";
      ContextSwitcher = () => (
        <OrganizationSwitcher isCollapsed={isCollapsed} />
      );
    }
  }

  const ExitButton = () => {
    if (isAgencyContext) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                clearActiveAgency();
                router.push("/business-actor/dashboard");
              }}
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <ArrowLeft
                className={cn("h-[18px] w-[18px]", !isCollapsed && "mr-3")}
              />
              {!isCollapsed && "Exit Agency"}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">Exit Agency</TooltipContent>
          )}
        </Tooltip>
      );
    }
    if (isBusinessActor) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                clearActiveOrganization();
                router.push("/dashboard");
                toast.info("Exited Business Workspace.");
              }}
              variant="ghost"
              className="flex items-center w-full justify-start h-9 px-3 text-sidebar-foreground hover:bg-amber-500/10 hover:text-amber-600"
            >
              <Power
                className={cn("h-[18px] w-[18px]", !isCollapsed && "mr-3")}
              />
              {!isCollapsed && "Exit Workspace"}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">Exit Workspace</TooltipContent>
          )}
        </Tooltip>
      );
    }
    return null;
  };

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
    const isActive = !isDisabled && pathname.startsWith(item.href);

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={isDisabled ? "#" : item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors h-9",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
              !isDisabled &&
                !isActive &&
                "text-sidebar-foreground hover:bg-sidebar-accent/80",
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
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen",
          isCollapsed ? "w-[72px]" : "w-64",
          isMobileOpen
            ? "translate-x-0 shadow-xl"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
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
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 ml-auto hidden lg:flex")}
            onClick={() => setIsCollapsed(!isCollapsed)}
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
              className="h-8 w-8 ml-auto lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <SidebarClose className="h-4 w-4" />
            </Button>
          )}
        </div>
        {ContextSwitcher && <ContextSwitcher />}
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <nav
            className={cn(
              "flex-1 space-y-1 py-4",
              isCollapsed ? "px-2" : "px-4"
            )}
          >
            {globalNav.length > 0 && (
              <>
                {globalNav.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
                <Separator className="my-3" />
              </>
            )}
            {mainNav.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
          <div
            className={cn("mt-auto border-t", isCollapsed ? "px-2" : "px-4")}
          >
            <div className="space-y-1 py-4">
              <ExitButton />
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => signOut({ callbackUrl: "/login" })}
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
