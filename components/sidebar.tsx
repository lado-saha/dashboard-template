"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Award,
  Briefcase,
  Building,
  Combine, // Icon for Services
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
  Package, // Icon for Products
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
import { OrganizationSwitcher } from "@/components/organization/organization-switcher";
import { useActiveOrganization } from "@/contexts/active-organization-context";

// --- Navigation Arrays ---
const baNavigation = [
  // REMOVED: { name: "Org. Selection", ... }
  { name: "Org. Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Org. Profile", href: "/profile", icon: Landmark },
  { name: "Products", href: "/products", icon: Package },
  { name: "Services", href: "/services", icon: Combine },
  { name: "Agencies", href: "/agencies", icon: Users2 },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Customers", href: "/customers", icon: UsersRound },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Sales People", href: "/sales-people", icon: UserCheck },
  { name: "Prospects", href: "/prospects", icon: Lightbulb },
  { name: "Third Parties", href: "/third-parties", icon: Briefcase },
  { name: "Certifications", href: "/certifications", icon: Award },
  { name: "Images", href: "/images", icon: ImageIconLucide },
  { name: "Practical Info", href: "/practical-info", icon: Info },
  { name: "Wallet", href: "/wallet", icon: Wallet, isGlobal: true },
  { name: "Bonus Config", href: "/bonus", icon: HandCoins, isGlobal: true },
  { name: "Webhooks", href: "/webhooks", icon: Webhook, isGlobal: true },
  { name: "Chat", href: "/chat", icon: MessagesSquare, isGlobal: true },
];

const customerNavigation = [
  {
    name: "Dashboard",
    href: "/customer/dashboard",
    icon: LayoutGrid,
    isGlobal: true,
  },
  {
    name: "Services",
    href: "/customer/services",
    icon: Briefcase,
    isGlobal: true,
  },
  {
    name: "Invoices",
    href: "/customer/invoices",
    icon: FileText,
    isGlobal: true,
  },
  {
    name: "My Bonus",
    href: "/customer/bonus",
    icon: HandCoins,
    isGlobal: true,
  },
  {
    name: "Favorites",
    href: "/customer/favorites",
    icon: FolderHeart,
    isGlobal: true,
  },
  {
    name: "Invite Friends",
    href: "/customer/invite",
    icon: Share2,
    isGlobal: true,
  },
  {
    name: "Chat",
    href: "/customer/chat",
    icon: MessagesSquare,
    isGlobal: true,
  },
];

const superAdminNavigation = [
  {
    name: "Dashboard",
    href: "/super-admin/dashboard",
    icon: LayoutGrid,
    isGlobal: true,
  },
  {
    name: "Platforms",
    href: "/super-admin/platforms",
    icon: Server,
    isGlobal: true,
  },
  {
    name: "Business Actors",
    href: "/super-admin/business-actors",
    icon: Building,
    isGlobal: true,
  },
  {
    name: "Customers",
    href: "/super-admin/customers",
    icon: Users,
    isGlobal: true,
  },
  {
    name: "Webhooks Config",
    href: "/super-admin/webhooks",
    icon: Webhook,
    isGlobal: true,
  },
  {
    name: "Bonus Overview",
    href: "/super-admin/bonus",
    icon: HandCoins,
    isGlobal: true,
  },
  {
    name: "Admin Comm.",
    href: "/super-admin/chat",
    icon: MessagesSquare,
    isGlobal: true,
  },
];

const bottomNavigation = [
  { name: "Help & Support", href: "/help", icon: HelpCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { activeOrganizationId, activeOrganizationDetails } =
    useActiveOrganization();

  const pathSegments = pathname.split("/").filter(Boolean);
  let currentRolePrefix = "/business-actor";
  if (pathSegments.length > 0) {
    if (
      ["customer", "super-admin", "business-actor"].includes(pathSegments[0])
    ) {
      currentRolePrefix = `/${pathSegments[0]}`;
    }
  }

  const isBaContext = currentRolePrefix === "/business-actor";

  let sidebarTitle = "BA Workspace";
  let currentNavigation = baNavigation;
  // This link should now point to the repurposed dashboard page
  let activeRoleDashboardLink = "/business-actor/dashboard";

  if (currentRolePrefix === "/customer") {
    sidebarTitle = "My Account";
    currentNavigation = customerNavigation;
    activeRoleDashboardLink = "/customer/dashboard";
  } else if (currentRolePrefix === "/super-admin") {
    sidebarTitle = "Platform Admin";
    currentNavigation = superAdminNavigation;
    activeRoleDashboardLink = "/super-admin/dashboard";
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  type NavItemProps = {
    item: {
      name: string;
      href: string;
      icon: React.ElementType;
      isGlobal?: boolean;
    };
  };

  const NavItem = ({ item }: NavItemProps) => {
    let finalHref = item.href;
    let isDisabled = false;

    if (isBaContext && !item.isGlobal) {
      if (activeOrganizationId) {
        finalHref = `/business-actor/org${item.href}`;
      } else {
        finalHref = "#";
        isDisabled = true;
      }
    } else if (isBaContext && item.isGlobal) {
      finalHref = item.href;
    } else {
      finalHref = item.href;
    }

    const isActive = pathname === finalHref && finalHref !== "#";

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={isDisabled ? "#" : finalHref}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors h-9",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
              !isDisabled &&
                !isActive &&
                "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
              isDisabled && "cursor-not-allowed text-muted-foreground/50",
              isCollapsed && "justify-center px-2"
            )}
            onClick={() =>
              isMobileOpen && !isDisabled && setIsMobileOpen(false)
            }
            aria-disabled={isDisabled}
            tabIndex={isDisabled ? -1 : undefined}
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
              src="/logo.svg"
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

        {isBaContext && !isCollapsed && <OrganizationSwitcher />}
        {isBaContext && isCollapsed && (
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
                {activeOrganizationDetails?.short_name || "Select Org"}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <nav
            className={cn(
              "flex-1 space-y-1 py-4",
              isCollapsed ? "px-2" : "px-4",
              isBaContext && !isCollapsed && "pt-0"
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
                <NavItem key={item.name} item={{ ...item, isGlobal: true }} />
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
    </TooltipProvider>
  );
}
