// FILE: app/(dashboard)/(business-actor)/dashboard/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BusinessActorDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Business Actor Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         <Card>
           <CardHeader>
             <CardTitle>Welcome!</CardTitle>
           </CardHeader>
           <CardContent>
             <p>This is your main dashboard. Add widgets and content here.</p>
             {/* TODO: Add dashboard widgets */}
           </CardContent>
         </Card>
         {/* Add more placeholder cards */}
      </div>
    </div>
  );
}