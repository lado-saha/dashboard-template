import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BusinessActorPostsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Published Posts</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Create, edit, and manage published posts or announcements.</p>
          {/* TODO: Implement Post editor and list */}
        </CardContent>
      </Card>
    </div>
  );
}