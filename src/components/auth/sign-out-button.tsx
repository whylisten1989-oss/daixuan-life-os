"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <Button variant="ghost" size="icon" type="button" aria-label="退出登录" title="退出登录" disabled={pending} onClick={signOut}>
      <LogOut aria-hidden="true" />
    </Button>
  );
}
