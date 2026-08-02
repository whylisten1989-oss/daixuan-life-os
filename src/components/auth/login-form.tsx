"use client";

import { motion } from "motion/react";
import { ArrowRight, LockKeyhole, Mountain } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const credentialsSchema = z.object({ email: z.email("请输入有效邮箱"), password: z.string().min(8, "密码至少 8 位") });

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = credentialsSchema.safeParse({ email, password });
    if (!validation.success) { setStatus(validation.error.issues[0]?.message ?? "输入有误"); return; }
    if (!configured) { setStatus("Supabase 尚未配置，请先查看演示界面。"); return; }
    setPending(true);
    setStatus("");
    const supabase = createClient();
    const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setPending(false);
    if (result.error) { setStatus(result.error.message); return; }
    if (mode === "signup" && !result.data.session) { setStatus("注册成功，请检查邮箱后完成验证。"); return; }
    router.push("/today");
    router.refresh();
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-sidebar px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-md border border-line-strong text-primary"><Mountain /></div><div><p className="font-semibold tracking-[0.08em]">岱旋 Life OS</p><p className="text-[10px] uppercase tracking-[0.22em] text-subtle">Daixuan</p></div></div>
        <div className="max-w-xl"><p className="text-xs tracking-[0.16em] text-muted">个人生活管理与行动中枢</p><h1 className="mt-5 text-5xl font-medium leading-[1.12] tracking-tight">把分散的生活信号，<br />变成下一步行动。</h1><div className="mt-10 grid grid-cols-3 border-y border-border py-5 text-sm"><span>任务与时间</span><span>财务与健康</span><span>知识与确认</span></div></div>
        <p className="text-xs text-subtle">Private workspace · 数据按空间隔离</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><Mountain className="text-primary" /><div><p className="font-semibold">岱旋 Life OS</p><p className="text-xs text-muted">个人生活管理与行动中枢</p></div></div>
          <LockKeyhole className="size-6 text-primary" />
          <h2 className="mt-5 text-3xl font-semibold">{mode === "login" ? "回到个人空间" : "创建个人空间"}</h2>
          <p className="mt-2 text-sm text-muted">登录后只访问你所属空间的数据。</p>
          {!configured ? <div className="mt-6 border-l-2 border-accent bg-accent-soft/55 px-4 py-3 text-sm"><p className="font-medium text-accent">Supabase 尚未配置</p><p className="mt-1 text-xs text-muted">云项目完成后启用真实登录；当前可先进入演示界面。</p></div> : null}
          <form className="mt-7 flex flex-col gap-5" onSubmit={submit}>
            <div className="flex flex-col gap-2"><Label htmlFor="email">邮箱</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></div>
            <div className="flex flex-col gap-2"><Label htmlFor="password">密码</Label><Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="至少 8 位" /></div>
            {status ? <p role="status" className="text-sm text-accent">{status}</p> : null}
            <Button size="lg" type="submit" disabled={pending}>{pending ? "处理中…" : mode === "login" ? "登录" : "注册"}<ArrowRight data-icon="inline-end" /></Button>
          </form>
          <div className="mt-5 flex items-center justify-between text-sm"><button className="text-muted hover:text-foreground" type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setStatus(""); }}>{mode === "login" ? "没有账户？注册" : "已有账户？登录"}</button><Link href="/demo" className="font-medium text-primary hover:underline">查看演示</Link></div>
        </motion.div>
      </section>
    </main>
  );
}
