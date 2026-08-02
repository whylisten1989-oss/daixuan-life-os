"use client";

import { ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const passwordSchema = z.object({
  password: z.string().min(8, "密码至少 8 位"),
  confirmation: z.string(),
}).refine((value) => value.password === value.confirmation, {
  message: "两次输入的密码不一致",
  path: ["confirmation"],
});

export function ResetPasswordForm({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [status, setStatus] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = passwordSchema.safeParse({ password, confirmation });
    if (!validation.success) {
      setStatus(validation.error.issues[0]?.message ?? "输入有误");
      return;
    }
    if (!configured) {
      setStatus("Supabase 尚未配置。");
      return;
    }

    setPending(true);
    setStatus("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) {
      setStatus(error.message);
      return;
    }
    setComplete(true);
    setStatus("密码已更新，可继续使用当前会话或重新登录。");
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md border-y border-line-strong py-8">
        <KeyRound className="size-6 text-primary" />
        <h1 className="mt-5 text-3xl font-semibold">设置新密码</h1>
        <p className="mt-2 text-sm text-muted">通过重置邮件进入，或在已登录状态下更新密码。</p>
        {!complete ? (
          <form className="mt-7 flex flex-col gap-5" onSubmit={submit}>
            <div className="flex flex-col gap-2"><Label htmlFor="new-password">新密码</Label><Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
            <div className="flex flex-col gap-2"><Label htmlFor="confirm-password">确认新密码</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
            {status ? <p role="status" className="text-sm text-accent">{status}</p> : null}
            <Button size="lg" type="submit" disabled={pending}>{pending ? "更新中…" : "更新密码"}</Button>
          </form>
        ) : <p role="status" className="mt-6 border-l-2 border-success px-4 py-3 text-sm text-success">{status}</p>}
        <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"><ArrowLeft className="size-4" />返回登录</Link>
      </section>
    </main>
  );
}
