"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Award, Briefcase, Building, Combine, FileText, FolderHeart, HandCoins, HelpCircle,
  ImageIcon as ImageIconLucide, Info, LayoutGrid, Lightbulb, LogOut, Landmark, Menu,
  MessagesSquare, Package, Server, Settings, Share2, SidebarClose, Truck, UserCheck,
  Users, Users2, UsersRound, Wallet, Webhook,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OrganizationSwitcher } from "@/components/organization/organization-switcher";
import { useActiveOrganization } from "@/contexts/active-organization-context";

const baNavigation = [
  { name: "Org. Dashboard", href: "/org/dashboard", icon: LayoutGrid, isOrgSpecific: true },
  { name: "Org. Profile", href: "/org/profile", icon: Landmark, isOrgSpecific: true },
  { name: "Products", href: "/org/products", icon: Package, isOrgSpecific: true },
  { name: "Services", href: "/org/services", icon: Combine, isOrgSpecific: true },
  { name: "Agencies", href: "/org/agencies", icon: Users2, isOrgSpecific: true },
  { name: "Employees", href: "/org/employees", icon: Users, isOrgSpecific: true },
  { name: "Customers", href: "/org/customers", icon: UsersRound, isOrgSpecific: true },
  { name: "Suppliers", href: "/org/suppliers", icon: Truck, isOrgSpecific: true },
  { name: "Sales People", href: "/org/sales-people", icon: UserCheck, isOrgSpecific: true },
  { name: "Prospects", href: "/org/prospects", icon: Lightbulb, isOrgSpecific: true },
  { name: "Third Parties", href: "/org/third-parties", icon: Briefcase, isOrgSpecific: true },
  { name: "Certifications", href: "/org/certifications", icon: Award, isOrgSpecific: true },
  { name: "Images", href: "/org/images", icon: ImageIconLucide, isOrgSpecific: true },
  { name: "Practical Info", href: "/org/practical-info", icon: Info, isOrgSpecific: true },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Bonus Config", href: "/bonus", icon: HandCoins },
  { name: "Webhooks", href: "/webhooks", icon: Webhook },
  { name: "Chat", href: "/chat", icon: MessagesSquare },
];

// For Normal Users
const userNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Services", href: "/services", icon: Briefcase },
  { name: "My Bonus", href: "/bonus", icon: HandCoins },
  { name: "Favorites", href: "/favorites", icon: FolderHeart },
  { name: "Invite Friends", href: "/invite", icon: Share2 },
];

const superAdminNavigation = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutGrid },
  { name: "Platforms", href: "/super-admin/platforms", icon: Server },
  { name: "Business Actors", href: "/super-admin/business-actors", icon: Building },
  { name: "Customers", href: "/super-admin/customers", icon: Users },
  { name: "Webhooks Config", href: "/super-admin/webhooks", icon: Webhook },
  { name: "Bonus Overview", href: "/super-admin/bonus", icon: HandCoins },
  { name: "Admin Comm.", href: "/super-admin/chat", icon: MessagesSquare },
];

const bottomNavigation = [
  { name: "Help & Support", href: "/help", icon: HelpCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MainSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { activeOrganizationId } = useActiveOrganization();

  const isBusinessActor = !!session?.user.businessActorId;
  const isSuperAdmin = session?.user.roles?.includes('SUPER_ADMIN_ROLE');

  let currentNavigation = userNavigation;
  let sidebarTitle = "My Account";
  let homeLink = "/dashboard";
  let rolePrefix = "";

  if (isSuperAdmin) {
    currentNavigation = superAdminNavigation;
    sidebarTitle = "Platform Admin";
    homeLink = "/super-admin/dashboard";
    rolePrefix = "/super-admin";
  } else if (isBusinessActor) {
    currentNavigation = baNavigation;
    sidebarTitle = "BA Workspace";
    homeLink = "/business-actor/dashboard";
    rolePrefix = "/business-actor";
  }

  const handleLogout = async () => await signOut({ callbackUrl: "/login" });

  const NavItem = ({ item }: { item: { name: string; href: string; icon: React.ElementType; isOrgSpecific?: boolean; } }) => {
    let finalHref = `${rolePrefix}${item.href}`;
    let isDisabled = false;

    if (item.isOrgSpecific) {
      finalHref = activeOrganizationId ? `${rolePrefix}${item.href}` : "#";
      isDisabled = !activeOrganizationId;
    }

    const isActive = finalHref !== "#" && pathname.startsWith(finalHref);

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild><Link href={isDisabled ? "#" : finalHref} className={cn("flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors h-9", isActive && "bg-sidebar-accent text-sidebar-accent-foreground", !isDisabled && !isActive && "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground", isDisabled && "cursor-not-allowed text-muted-foreground/50", isCollapsed && "justify-center px-2")} onClick={() => isMobileOpen && !isDisabled && setIsMobileOpen(false)} aria-disabled={isDisabled} tabIndex={isDisabled ? -1 : undefined}><item.icon className={cn("h-[18px] w-[18px] shrink-0", !isCollapsed && "mr-3")} />{!isCollapsed && <span className="truncate">{item.name}</span>}</Link></TooltipTrigger>
        {isCollapsed && (<TooltipContent side="right">{item.name}</TooltipContent>)}
      </Tooltip>
    );
  };

  return (
    <>
      <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-[60] rounded-md shadow-md bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(!isMobileOpen)} aria-label="Toggle sidebar"><Menu className="h-5 w-5" /></Button>
      <div className={cn("fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen", isCollapsed ? "w-[72px]" : "w-64", isMobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0")} data-collapsed={isCollapsed}>
        <div className={cn("flex h-16 shrink-0 items-center border-b border-sidebar-border", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
          <Link href={homeLink} className={cn("flex items-center gap-2 font-semibold")} onClick={() => isMobileOpen && setIsMobileOpen(false)} aria-label={sidebarTitle}>
            <Image src="/logo.svg" alt={`${sidebarTitle} Logo`} width={32} height={32} className="shrink-0" priority />
            {!isCollapsed && <span className="text-lg truncate">{sidebarTitle}</span>}
          </Link>
          <Button variant="ghost" size="icon" className={cn("hidden h-8 w-8 lg:flex", isCollapsed ? "" : "ml-auto")} onClick={() => setIsCollapsed(!isCollapsed)} aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}><SidebarClose className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} /></Button>
          {isMobileOpen && <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 lg:hidden" onClick={() => setIsMobileOpen(false)} aria-label="Close Sidebar"><SidebarClose className="h-4 w-4" /></Button>}
        </div>
        <TooltipProvider>
          {isBusinessActor && <OrganizationSwitcher isCollapsed={isCollapsed} />}
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <nav className={cn("flex-1 space-y-1 py-4", isCollapsed ? "px-2" : "px-4", isBusinessActor && !isCollapsed && "pt-0")}>
              {currentNavigation.map((item) => <NavItem key={item.name} item={item} />)}
            </nav>
            <div className={cn("mt-auto border-t border-sidebar-border", isCollapsed ? "px-2" : "px-4")}>
              <div className="space-y-1 py-4">
                {bottomNavigation.map((item) => <NavItem key={item.name} item={item} />)}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className={cn("flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-colors h-9", "text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive", isCollapsed ? "justify-center px-2" : "justify-start")} onClick={() => { handleLogout(); if (isMobileOpen) setIsMobileOpen(false); }}>
                      <LogOut className={cn("h-[18px] w-[18px] shrink-0", !isCollapsed && "mr-3")} />
                      {!isCollapsed && <span className="truncate">Logout</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
                </Tooltip>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" aria-hidden="true" onClick={() => setIsMobileOpen(false)} />}
    </>
  );
}
