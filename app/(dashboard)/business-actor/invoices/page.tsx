import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BusinessActorInvoicesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Invoices Overview</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <p>View, manage, and generate invoices (for subscriptions, sales, etc.).</p>
          {/* TODO: Implement Invoice Table, filtering, creation/automation */}
        </CardContent>
      </Card>
    </div>
  );
}