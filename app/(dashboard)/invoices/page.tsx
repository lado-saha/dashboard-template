import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function CustomerInvoicesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Invoices</h1>
        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="payment_details">Payment Details</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
                <Card>
                    <CardHeader><CardTitle>Invoice History</CardTitle></CardHeader>
                    <CardContent>
                    <p>View your past invoices and their payment status.</p>
                    {/* TODO: Implement Invoice list/table for customer */}
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="payment_details">
                <Card>
                    <CardHeader><CardTitle>Saved Payment Methods</CardTitle></CardHeader>
                    <CardContent>
                    <p>Manage your saved payment details (e.g., credit cards).</p>
                    {/* TODO: Implement payment method management UI */}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}