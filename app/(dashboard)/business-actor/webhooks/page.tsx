import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BusinessActorWebhooksPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Webhooks & Alerts</h1>
      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Webhooks</TabsTrigger>
          <TabsTrigger value="templates">Alert Templates</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="manage">
          <Card>
            <CardHeader><CardTitle>Configure Webhooks</CardTitle></CardHeader>
            <CardContent>
              <p>Set up webhooks to receive notifications for specific events.</p>
              {/* TODO: Implement webhook creation/management form and list */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="templates">
          <Card>
            <CardHeader><CardTitle>Notification Templates</CardTitle></CardHeader>
            <CardContent>
              <p>Customize the templates used for webhook alerts.</p>
              {/* TODO: Implement template editor/manager */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader><CardTitle>Webhook Delivery Logs</CardTitle></CardHeader>
            <CardContent>
              <p>View the history and status of webhook deliveries.</p>
              {/* TODO: Implement webhook log viewer */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}