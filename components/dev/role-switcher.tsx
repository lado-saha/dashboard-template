"use client";

import * as React from "react";
import { useRouter } from "next/navigation"; // Use App Router's router
import { Building2, User, ShieldAlert } from "lucide-react"; // Icons for roles

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Role = "business-actor" | "customer" | "super-admin";

interface RoleSwitcherProps {
  currentRole: Role | null; // The role derived from the current URL path
  className?: string;
}

const roles: { value: Role; label: string; icon: React.ElementType }[] = [
  { value: "business-actor", label: "Business Actor", icon: Building2 },
  { value: "customer", label: "Customer", icon: User },
  { value: "super-admin", label: "Super Admin", icon: ShieldAlert },
];

export function RoleSwitcher({ currentRole, className }: RoleSwitcherProps) {
  const router = useRouter();
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(currentRole ?? undefined);

  // Sync select value if the URL changes externally
  React.useEffect(() => {
    setSelectedValue(currentRole ?? undefined);
  }, [currentRole]);

  const handleRoleChange = (newRole: string) => {
    const role = newRole as Role;
    setSelectedValue(role);
    // Navigate to the dashboard of the selected role
    router.push(`/${role}/dashboard`);
  };

  // Only render in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Optional: Add a label */}
      {/* <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Dev Role:</span> */}
      <Select value={selectedValue} onValueChange={handleRoleChange}>
        <SelectTrigger
          className="w-auto h-9 text-xs sm:text-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-0 shadow-sm border-dashed border-yellow-500"
          aria-label="Switch development role"
        >
          <SelectValue placeholder="Select Role..." />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value} className="text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <role.icon className="h-4 w-4 text-muted-foreground" />
                <span>{role.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}