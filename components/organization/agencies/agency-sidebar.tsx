"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AgencySwitcher } from "./agency-switcher";
import {
  ArrowLeft,
  Building,
  UserCheck,
  Users,
  UsersRound,
  Lightbulb,
  Truck,
  Landmark,
  LayoutGrid,
  SidebarClose,
  Menu,
} from "lucide-react";

const agencyNavLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Profile", href: "/profile", icon: Landmark },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Customers", href: "/customers", icon: UsersRound },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Sales People", href: "/sales-people", icon: UserCheck },
  { name: "Prospects", href: "/prospects", icon: Lightbulb },
];

export function AgencySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { clearActiveAgency, activeAgencyDetails } = useActiveOrganization();

  const handleExitAgency = () => {
    clearActiveAgency();
    router.push("/business-actor/org/agencies");
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const NavItem = ({
    item,
  }: {
    item: { name: string; href: string; icon: React.ElementType };
  }) => {
    const finalHref = `/business-actor/agency${item.href}`;
    const isActive = pathname.startsWith(finalHref);
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
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background text-foreground transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen",
          isCollapsed ? "w-[72px]" : "w-64",
          isMobileOpen
            ? "translate-x-0 shadow-xl"
            : "-translate-x-full lg:translate-x-0"
        )}
        data-collapsed={isCollapsed}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b",
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          <Link
            href="/business-actor/agency/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            {activeAgencyDetails?.logo ? (
              <Image
                src={activeAgencyDetails.logo}
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-md"
              />
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-md bg-muted flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
            )}
            {!isCollapsed && (
              <span className="text-lg truncate">
                {activeAgencyDetails?.short_name || "Agency"}
              </span>
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
        <TooltipProvider>
          <div
            className={cn(
              "border-b",
              isCollapsed && "py-3 flex justify-center items-center"
            )}
          >
            <AgencySwitcher isCollapsed={isCollapsed} />
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <nav
              className={cn(
                "flex-1 space-y-1 py-4",
                isCollapsed ? "px-2" : "px-4",
                !isCollapsed && "pt-2"
              )}
            >
              {agencyNavLinks.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
            <div
              className={cn("mt-auto border-t", isCollapsed ? "px-2" : "px-4")}
            >
              <div className="space-y-1 py-4">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleExitAgency}
                      variant="ghost"
                      className={cn(
                        "flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-colors h-9 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive",
                        isCollapsed ? "justify-center px-2" : "justify-start"
                      )}
                    >
                      <ArrowLeft
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          !isCollapsed && "mr-3"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate">Exit Agency View</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      Exit to Organization
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
