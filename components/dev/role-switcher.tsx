"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, ShieldAlert } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Role = "user" | "super-admin";

interface DevRoleSwitcherProps {
  className?: string;
}

export function DevRoleSwitcher({ className }: DevRoleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentRole: Role = pathname.startsWith('/super-admin') ? 'super-admin' : 'user';

  const handleRoleChange = (newRole: Role) => {
    if (newRole === 'super-admin') {
      router.push(`/super-admin/dashboard`);
    } else {
      router.push(`/dashboard`);
    }
  };

  // This component will only render in the development environment
  // if (process.env.NODE_ENV !== 'development') {
  //   return null;
  // }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={currentRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-auto h-9 text-xs sm:text-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus-visible:ring-0 shadow-sm border-dashed border-amber-500/50">
          <SelectValue placeholder="Switch Role..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user" className="text-xs sm:text-sm">
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>User View</span></div>
          </SelectItem>
          <SelectItem value="super-admin" className="text-xs sm:text-sm">
            <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-muted-foreground" /><span>Super Admin View</span></div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
