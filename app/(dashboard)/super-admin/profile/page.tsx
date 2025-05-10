import React from 'react';
import { redirect } from 'next/navigation';

export default function SuperAdminProfilePage() {
  // Redirecting to the main settings page's account tab
  // Adjust the target tab if needed (e.g., using query params if implemented)
  redirect('/super-admin/settings');

  // Or, if you want a dedicated page, keep simple content:
  /*
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Profile</h1>
      <p>This page displays admin profile details. Consider consolidating with Settings.</p>
      {}
    </div>
  );
  */
}
// END OF FILE: app/(dashboard)/super-admin/profile/page.tsx