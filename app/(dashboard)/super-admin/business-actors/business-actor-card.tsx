"use client";

import { BusinessActorDto } from "@/types/organization";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BusinessActorCardProps {
  actor: BusinessActorDto;
  onEditAction: (actor: BusinessActorDto) => void;
  onDeleteAction: (actor: BusinessActorDto) => void;
}

export function BusinessActorCard({
  actor,
  onEditAction,
  onDeleteAction,
}: BusinessActorCardProps) {
  const name = `${actor.first_name || ""} ${actor.last_name || ""}`.trim();
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={actor.avatar_picture} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base line-clamp-1">{name}</CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                {actor.profession || "No profession listed"}
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
              <DropdownMenuItem onClick={() => onEditAction(actor)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteAction(actor)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge variant="secondary">{actor.type || "UNKNOWN"}</Badge>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {actor.is_active ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}{" "}
          {actor.is_active ? "Active" : "Inactive"}
        </div>
        <div className="flex items-center gap-1">
          {actor.is_verified ? (
            <CheckCircle className="h-4 w-4 text-sky-500" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}{" "}
          {actor.is_verified ? "Verified" : "Not Verified"}
        </div>
      </CardFooter>
    </Card>
  );
}
