// FILE: app/forgot-password/page.tsx
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30 dark:to-muted/10">
      <ForgotPasswordForm />
    </div>
  );
}