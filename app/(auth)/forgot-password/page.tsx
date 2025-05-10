import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    // Use a consistent container style for auth pages
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30 dark:to-muted/10">
      {/* Apply entry animation to the form card */}
      <div className="animate-fade-in-up">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}