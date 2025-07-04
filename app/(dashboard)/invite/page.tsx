import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CustomerInvitePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Invite Friends & Referrals</h1>
      <Card>
        <CardHeader>
          <CardTitle>Share & Earn Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Invite friends to join and earn rewards through our referral program.</p>
          <div className='space-y-2'>
            <Label htmlFor='referral-link'>Your Referral Link</Label>
            <div className='flex gap-2'>
              <Input id="referral-link" readOnly value="https://yowyob.com/ref/cust123" />{/* TODO: Generate dynamically */}
              <Button>Copy Link</Button> {/* TODO: Add copy functionality */}
            </div>
          </div>
          {/* TODO: Add social sharing buttons */}
          {/* TODO: Display referral statistics (invited friends, rewards earned) */}
        </CardContent>
      </Card>
    </div>
  );
}