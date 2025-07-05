"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Award, Briefcase, Building, Combine, FileText, FolderHeart, HandCoins, HelpCircle,
  ImageIcon as ImageIconLucide, Info, LayoutGrid, Lightbulb, LogOut, Landmark, Menu,
  MessagesSquare, Package, Server, Settings, Share2, SidebarClose, Truck, UserCheck,
  Users, Users2, UsersRound, Wallet, Webhook, ArrowRight, ArrowLeft, UserCog
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OrganizationSwitcher } from "@/components/organization/organization-switcher";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { Separator } from "./ui/separator";

// --- Navigation Arrays ---
const baOrgSpecificNavigation = [
  { name: "Dashboard", href: "/business-actor/dashboard", icon: LayoutGrid },
  { name: "Org. Profile", href: "/business-actor/org/profile", icon: Landmark },
  { name: "Products", href: "/business-actor/org/products", icon: Package },
  { name: "Services", href: "/business-actor/org/services", icon: Combine },
  { name: "Agencies", href: "/business-actor/org/agencies", icon: Users2 },
  { name: "Employees", href: "/business-actor/org/employees", icon: Users },
  { name: "Customers", href: "/business-actor/org/customers", icon: UsersRound },
  { name: "Suppliers", href: "/business-actor/org/suppliers", icon: Truck },
  { name: "Sales People", href: "/business-actor/org/sales-people", icon: UserCheck },
  { name: "Prospects", href: "/business-actor/org/prospects", icon: Lightbulb },
  { name: "Third Parties", href: "/business-actor/org/third-parties", icon: Briefcase },
  { name: "Certifications", href: "/business-actor/org/certifications", icon: Award },
  { name: "Images", href: "/business-actor/org/images", icon: ImageIconLucide },
  { name: "Practical Info", href: "/business-actor/org/practical-info", icon: Info },
];
const baGlobalNavigation = [
  { name: "My BA Profile", href: "/business-actor/profile", icon: UserCog },
  { name: "Wallet", href: "/business-actor/wallet", icon: Wallet },
  { name: "Bonus Config", href: "/business-actor/bonus", icon: HandCoins },
  { name: "Webhooks", href: "/business-actor/webhooks", icon: Webhook },
  { name: "Chat", href: "/business-actor/chat", icon: MessagesSquare },
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
// const superAdminNavigation = [ /* ... content ... */ ];

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
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { activeOrganizationId } = useActiveOrganization();

  // FIX #1: When opening on mobile, ensure it's always expanded.
  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
    if (!isMobileOpen) {
      setIsCollapsed(false); // Force expanded state when mobile menu opens
    }
  };

  const isBusinessActor = !!session?.user.businessActorId;
  const isSuperAdminContext = pathname.startsWith('/super-admin');
  const isBusinessActorContext = pathname.startsWith('/business-actor');

  let currentNavigation = userNavigation;
  let sidebarTitle = "My Account";
  let homeLink = "/dashboard";

  if (isSuperAdminContext) {
    currentNavigation = superAdminNavigation;
    sidebarTitle = "Platform Admin";
    homeLink = "/super-admin/dashboard";
  } else if (isBusinessActorContext) {
    currentNavigation = baOrgSpecificNavigation;
    sidebarTitle = "BA Workspace";
    homeLink = "/business-actor/dashboard";
  }

  const handleLogout = async () => await signOut({ callbackUrl: "/login" });

  const NavItem = ({ item }: { item: { name: string; href: string; icon: React.ElementType; } }) => {
    const isDisabled = isBusinessActorContext && !activeOrganizationId && item.href.startsWith('/business-actor/');
    const finalHref = isDisabled ? "#" : item.href;
    const isActive = !isDisabled && pathname.startsWith(finalHref);

    return (<Tooltip delayDuration={0}><TooltipTrigger asChild><Link href={finalHref} className={cn("flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors h-9", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/80", isDisabled && "cursor-not-allowed text-muted-foreground/50", isCollapsed && "justify-center px-2")} onClick={() => isMobileOpen && !isDisabled && setIsMobileOpen(false)} aria-disabled={isDisabled} tabIndex={isDisabled ? -1 : undefined}><item.icon className={cn("h-[18px] w-[18px] shrink-0", !isCollapsed && "mr-3")} />{!isCollapsed && <span className="truncate">{item.name}</span>}</Link></TooltipTrigger>{isCollapsed && (<TooltipContent side="right">{item.name}</TooltipContent>)}</Tooltip>);
  };

  return (
    <TooltipProvider>
      <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-[60]" onClick={handleMobileToggle}><Menu className="h-5 w-5" /></Button>
      <div className={cn("fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen", isCollapsed ? "w-[72px]" : "w-64", isMobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0")}>
        <div className={cn("flex h-16 shrink-0 items-center border-b px-4", isCollapsed && "justify-center px-2")}>
          <Link href={homeLink} className="flex items-center gap-2 font-semibold"><Image src="/logo.svg" alt="Logo" width={32} height={32} priority className="h-8 w-8 shrink-0" />{!isCollapsed && <span className="text-lg truncate">{sidebarTitle}</span>}</Link>
          <Button variant="ghost" size="icon" className={cn("hidden h-8 w-8 lg:flex", isCollapsed ? "" : "ml-auto")} onClick={() => setIsCollapsed(!isCollapsed)}><SidebarClose className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} /></Button>
        </div>

        {isBusinessActorContext && (
          <div className={cn("border-b p-1", isCollapsed && "flex justify-center")}>
            <OrganizationSwitcher isCollapsed={isCollapsed} />
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <nav className={cn("flex-1 space-y-1 py-4", isCollapsed ? "px-2" : "px-4")}>
            {currentNavigation.map((item) => <NavItem key={item.name} item={item} />)}
            {isBusinessActorContext && <><Separator className="my-3" />{baGlobalNavigation.map((item) => <NavItem key={item.name} item={item} />)}</>}
            {!isBusinessActorContext && isBusinessActor && (
              <><Separator className="my-3" /><Tooltip delayDuration={0}><TooltipTrigger asChild><Button onClick={() => router.push('/business-actor/dashboard')} variant="ghost" className="group relative flex items-center w-full justify-start h-9 px-3 text-primary hover:text-primary hover:bg-primary/10 transition-shadow hover:shadow-[0_0_15px_theme(colors.primary/0.4)]"><ArrowRight className={cn("h-[18px] w-[18px] transition-transform group-hover:translate-x-1", !isCollapsed && "mr-3")} />{!isCollapsed && "Enter BA Workspace"}</Button></TooltipTrigger>{isCollapsed && <TooltipContent side="right">Enter BA Workspace</TooltipContent>}</Tooltip></>
            )}
          </nav>
          <div className={cn("mt-auto border-t border-sidebar-border px-4", isCollapsed && "px-2")}>
            <div className="space-y-1 py-4">
              {isBusinessActorContext && (
                <Tooltip delayDuration={0}><TooltipTrigger asChild><Button onClick={() => router.push('/dashboard')} variant="ghost" className="group relative flex items-center w-full justify-start h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 transition-shadow hover:shadow-[0_0_15px_theme(colors.destructive/0.25)]"><ArrowLeft className={cn("h-[18px] w-[18px] transition-transform group-hover:-translate-x-1", !isCollapsed && "mr-3")} />{!isCollapsed && "Exit BA Workspace"}</Button></TooltipTrigger>{isCollapsed && <TooltipContent side="right">Exit BA Workspace</TooltipContent>}</Tooltip>
              )}
              {bottomNavigation.map((item) => <NavItem key={item.name} item={item} />)}
              <Tooltip delayDuration={0}><TooltipTrigger asChild><Button onClick={handleLogout} variant="ghost" className="flex items-center w-full justify-start h-9 px-3 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"><LogOut className={cn("h-[18px] w-[18px]", !isCollapsed && "mr-3")} />{!isCollapsed && "Logout"}</Button></TooltipTrigger>{isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}</Tooltip>
            </div>
          </div>
        </div>
      </div>
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsMobileOpen(false)} />}
    </TooltipProvider>
  );
}
