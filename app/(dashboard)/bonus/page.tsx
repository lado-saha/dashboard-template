import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

export default function CustomerBonusPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mes Bonus / My Bonus</h1>
      <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Consulter mes Points / Check My Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">1,234 Pts</p> {/* TODO: Fetch dynamically */}
              <p className="text-sm text-muted-foreground mt-2">Valeur en monnaie / Monetary Value: $12.34</p> {/* TODO: Fetch/Calculate dynamically */}
               {/* TODO: Show history of points earned/spent */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Convertir mes points / Convert My Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Redeem your points for rewards or discounts.</p>
              <Button className="mt-4" disabled>Convert Points</Button> {/* TODO: Implement conversion logic */}
              {/* TODO: Show available rewards/conversion options */}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}