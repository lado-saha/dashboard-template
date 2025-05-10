
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BusinessActorReservationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reservations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <p>View and manage customer reservations and their statuses.</p>
          {/* TODO: Implement Reservations table/calendar view */}
        </CardContent>
      </Card>
    </div>
  );
}