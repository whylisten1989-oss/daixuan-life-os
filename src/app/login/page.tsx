import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { supabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "登录" };

export default function LoginPage() {
  return <LoginForm configured={supabaseConfigured} />;
}
