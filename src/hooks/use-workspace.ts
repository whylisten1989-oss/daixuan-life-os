"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Workspace } from "@/types/life";

export function useWorkspace() {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: async (): Promise<Workspace> => {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError ?? new Error("登录状态已失效");

      const [profileResult, membershipResult] = await Promise.all([
        supabase.from("profiles").select("display_name, timezone").eq("user_id", userData.user.id).maybeSingle(),
        supabase.from("space_members").select("space_id, role").eq("user_id", userData.user.id).order("created_at").limit(1).maybeSingle(),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (membershipResult.error || !membershipResult.data) throw membershipResult.error ?? new Error("未找到可用空间");

      const { data: space, error: spaceError } = await supabase.from("spaces").select("name").eq("id", membershipResult.data.space_id).single();
      if (spaceError) throw spaceError;
      const email = userData.user.email ?? "";
      return {
        userId: userData.user.id,
        email,
        displayName: profileResult.data?.display_name || email.split("@")[0] || "用户",
        timezone: profileResult.data?.timezone || "Asia/Shanghai",
        spaceId: membershipResult.data.space_id,
        spaceName: space.name,
        role: membershipResult.data.role,
      };
    },
  });
}
