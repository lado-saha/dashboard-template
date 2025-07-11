"use client";

import { useRouter } from "next/navigation";
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
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function CommandPalette({ isOpen, setIsOpen }: CommandPaletteProps) {
  const router = useRouter();
  const { userOrganizations, agenciesForCurrentOrg, activeOrganizationId } =
    useActiveOrganization();

  const runCommand = (command: () => unknown) => {
    setIsOpen(false);
    command();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
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
        </CommandGroup>

        {activeOrganizationId && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Active Organization">
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/org/agencies"))
                }
              >
                <Building className="mr-2 h-4 w-4" />
                <span>Manage Agencies</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => router.push("/business-actor/org/employees"))
                }
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Manage Employees</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {userOrganizations.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Organizations">
              {userOrganizations.map((org) => (
                <CommandItem
                  key={org.organization_id}
                  onSelect={() =>
                    runCommand(() => router.push("/business-actor/dashboard"))
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{org.long_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {agenciesForCurrentOrg.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Agencies">
              {agenciesForCurrentOrg.map((agency) => (
                <CommandItem
                  key={agency.agency_id}
                  onSelect={() =>
                    runCommand(() =>
                      router.push("/business-actor/agency/dashboard")
                    )
                  }
                >
                  <Building className="mr-2 h-4 w-4" />
                  <span>{agency.long_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
