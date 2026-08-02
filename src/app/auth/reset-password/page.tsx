import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { supabaseConfigured } from "@/lib/env";

export default function ResetPasswordPage() {
  return <ResetPasswordForm configured={supabaseConfigured} />;
}
