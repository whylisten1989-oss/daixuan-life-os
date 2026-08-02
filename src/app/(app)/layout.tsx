import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { supabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured) redirect("/login");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
