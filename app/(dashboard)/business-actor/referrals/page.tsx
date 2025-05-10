import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BusinessActorReferralsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Referrals & Invites</h1>
      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage your referral program, track invites, and view rewards.</p>
          {/* TODO: Implement Referral stats, invite links/form, reward tracking */}
        </CardContent>
      </Card>
    </div>
  );
}