"use client";

import { UserDto } from "@/types/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Phone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserCardProps {
  user: UserDto;
  onStatusToggleAction: (user: UserDto) => void;
  onVerifyAction: (user: UserDto, type: "email" | "phone") => void;
}

export function UserCard({
  user,
  onStatusToggleAction,
  onVerifyAction,
}: UserCardProps) {
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base line-clamp-1">{name}</CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                @{user.username}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusToggleAction(user)}>
                {user.is_enabled ? "Disable" : "Enable"}
              </DropdownMenuItem>
              {!user.email_verified && (
                <DropdownMenuItem onClick={() => onVerifyAction(user, "email")}>
                  Verify Email
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs">
        <Badge
          variant={user.is_enabled ? "default" : "destructive"}
          className={user.is_enabled ? "bg-green-100 text-green-800" : ""}
        >
          {user.is_enabled ? "Enabled" : "Disabled"}
        </Badge>
        <div className="flex items-center gap-2 text-muted-foreground">
          {user.email_verified && (
            <ShieldCheck
              className="h-4 w-4 text-sky-500"
              // title="Email Verified"
            />
          )}
          {user.phone_number_verified && (
            <Phone className="h-4 w-4 text-sky-500" />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
