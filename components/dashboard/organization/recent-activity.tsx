import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock Data
const activities = [
  { user: "Liam Johnson", avatar: "https://i.pravatar.cc/150?u=a1", action: "added a new employee:", target: "Olivia Davis" },
  { user: "Emma Williams", avatar: "https://i.pravatar.cc/150?u=a2", action: "updated the agency:", target: "Innovate East" },
  { user: "Noah Brown", avatar: "https://i.pravatar.cc/150?u=a3", action: "created a new customer profile:", target: "TechCorp Inc." },
  { user: "Ava Jones", avatar: "https://i.pravatar.cc/150?u=a4", action: "added a new supplier:", target: "Global Supplies" },
  { user: "William Garcia", avatar: "https://i.pravatar.cc/150?u=a5", action: "changed the status of:", target: "Main Project" },
];

export function RecentActivity() {
  return (
    <Card className="col-span-4 md:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>An overview of recent actions within your organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.avatar} alt="Avatar" />
                  <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    <span className="font-semibold text-primary">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.target}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
