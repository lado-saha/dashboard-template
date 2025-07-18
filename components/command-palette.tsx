"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActiveOrganization } from "@/contexts/active-organization-context";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutGrid,
  Building,
  Users,
  Settings,
  HelpCircle,
  FileText,
  Briefcase,
  Store,
  Award,
  HeartHandshake,
  UsersRound,
  Truck,
  UserCheck,
  UserSearch,
  ClipboardList,
  Info,
  Package,
  ConciergeBell,
  Building2,
  ShieldCheck,
  Server,
  HandCoins,
  FolderHeart,
  Image as ImageIcon,
  PlusCircle,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function CommandPalette({ isOpen, setIsOpen }: CommandPaletteProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    userOrganizations,
    agenciesForCurrentOrg,
    activeOrganizationId,
    activeAgencyId,
    setActiveOrganization,
    setActiveAgency,
  } = useActiveOrganization();

  // Helper to close the palette and navigate
  const runCommand = (command: () => unknown) => {
    setIsOpen(false);
    command();
  };

  const isBusinessActor = !!session?.user.businessActorId;
  const isSuperAdmin = session?.user.roles?.includes("SUPER_ADMIN_ROLE");

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* --- General & User Navigation --- */}
        <CommandGroup heading="General">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/help"))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/bonus"))}>
            <HandCoins className="mr-2 h-4 w-4" />
            <span>My Bonus</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/favorites"))}
          >
            <FolderHeart className="mr-2 h-4 w-4" />
            <span>My Favorites</span>
          </CommandItem>
        </CommandGroup>

        {/* --- Business Actor Navigation --- */}
        {isBusinessActor && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Business Workspace">
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/organizations"))
                }
              >
                <Building className="mr-2 h-4 w-4" />
                <span>Organizations Hub</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() =>
                    router.push("/business-actor/organization/create")
                  )
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Create New Organization</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* --- Active Organization Commands --- */}
        {activeOrganizationId && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Active Organization">
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/dashboard"))
                }
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>Org Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/org/profile"))
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Org Profile</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/org/agencies"))
                }
              >
                <Store className="mr-2 h-4 w-4" />
                <span>Agencies</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/org/employees"))
                }
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Employees</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/org/customers"))
                }
              >
                <HeartHandshake className="mr-2 h-4 w-4" />
                <span>Customers</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/org/suppliers"))
                }
              >
                <Truck className="mr-2 h-4 w-4" />
                <span>Suppliers</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() =>
                    router.push("/business-actor/org/sales-people")
                  )
                }
              >
                <UserCheck className="mr-2 h-4 w-4" />
                <span>Sales People</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/org/prospects"))
                }
              >
                <UserSearch className="mr-2 h-4 w-4" />
                <span>Prospects</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() =>
                    router.push("/business-actor/org/certifications")
                  )
                }
              >
                <Award className="mr-2 h-4 w-4" />
                <span>Certifications</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/org/images"))
                }
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Media Library</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* --- Active Agency Commands --- */}
        {activeAgencyId && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Active Agency">
              <CommandItem
                onSelect={() =>
                  runCommand(() =>
                    router.push("/business-actor/agency/dashboard")
                  )
                }
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>Agency Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() =>
                    router.push("/business-actor/agency/profile")
                  )
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Agency Profile</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() =>
                    router.push("/business-actor/agency/employees")
                  )
                }
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Agency Employees</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() =>
                    router.push("/business-actor/agency/customers")
                  )
                }
              >
                <UsersRound className="mr-2 h-4 w-4" />
                <span>Agency Customers</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* --- Super Admin Navigation --- */}
        {isSuperAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Super Admin">
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/super-admin/dashboard"))
                }
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>Platform Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/super-admin/users"))
                }
              >
                <Users className="mr-2 h-4 w-4" />
                <span>User Management</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/super-admin/roles"))
                }
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Roles & Permissions</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/super-admin/organizations"))
                }
              >
                <Building className="mr-2 h-4 w-4" />
                <span>Global Organizations</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/super-admin/business-domains"))
                }
              >
                <Server className="mr-2 h-4 w-4" />
                <span>Business Domains</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* --- Dynamic Organization & Agency Switcher --- */}
        {userOrganizations.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Switch Organization">
              {userOrganizations.map((org) => (
                <CommandItem
                  key={org.organization_id}
                  onSelect={() =>
                    runCommand(() =>
                      setActiveOrganization(org.organization_id!, org)
                    )
                  }
                >
                  <Building className="mr-2 h-4 w-4" />
                  <span>{org.short_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {agenciesForCurrentOrg.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Switch Agency">
              {agenciesForCurrentOrg.map((agency) => (
                <CommandItem
                  key={agency.agency_id}
                  onSelect={() =>
                    runCommand(() => setActiveAgency(agency.agency_id!, agency))
                  }
                >
                  <Store className="mr-2 h-4 w-4" />
                  <span>{agency.short_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
