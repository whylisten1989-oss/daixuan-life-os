"use client";

import { Database, KeyRound, Palette, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "./module-header";

export function SettingsScreen({ demo = false }: { demo?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-7 sm:px-6 lg:px-8">
      <ModuleHeader icon={Settings} title="设置" description="管理个人空间、主题和服务连接。" />
      <div className="mt-7 divide-y divide-border border-y border-line-strong">
        <SettingRow icon={Palette} title="深色主题" description="深浅主题都使用同一套语义 Token。"><Switch checked={resolvedTheme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} aria-label="深色主题" /></SettingRow>
        <SettingRow icon={Users} title="个人空间" description="第一阶段只启用个人空间，数据模型已预留家庭空间。"><Button variant="outline" size="sm">管理空间</Button></SettingRow>
        <SettingRow icon={Shield} title="数据隔离" description="数据库通过 spaceId、成员关系和 RLS 三层约束。"><span className="text-xs text-success">已启用</span></SettingRow>
        <SettingRow icon={Database} title="Supabase" description="认证、PostgreSQL 与 RLS。"><span className={demo ? "text-xs text-muted" : "text-xs text-success"}>{demo ? "演示模式" : "Preview 已连接"}</span></SettingRow>
        <SettingRow icon={KeyRound} title="账户密码" description={demo ? "真实账户中可通过验证邮件重置密码。" : "更新当前账户密码，或从登录页发送重置邮件。"}>{demo ? <span className="text-xs text-muted">演示模式</span> : <Button asChild variant="outline" size="sm"><Link href="/auth/reset-password">修改密码</Link></Button>}</SettingRow>
        <SettingRow icon={KeyRound} title="AI 服务" description="DeepSeek 尚未连接，操作确认策略已建立。"><span className="text-xs text-accent">未配置</span></SettingRow>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, title, description, children }: { icon: typeof Settings; title: string; description: string; children: React.ReactNode }) {
  return <section className="grid gap-4 py-5 sm:grid-cols-[36px_1fr_auto] sm:items-center"><Icon className="size-5 text-muted" /><div><h2 className="text-sm font-medium">{title}</h2><p className="mt-1 text-xs text-muted">{description}</p></div><div>{children}</div></section>;
}
