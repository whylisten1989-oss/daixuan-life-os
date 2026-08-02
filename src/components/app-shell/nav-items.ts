import { Bot, BookOpen, CircleUserRound, HeartPulse, ListChecks, Settings, SunMedium, WalletCards } from "lucide-react";

export const navItems = [
  { href: "/today", demoHref: "/demo", label: "今日中枢", short: "今日", icon: SunMedium },
  { href: "/tasks", demoHref: "/demo/tasks", label: "任务中心", short: "任务", icon: ListChecks },
  { href: "/finance", demoHref: "/demo/finance", label: "财务中心", short: "财务", icon: WalletCards },
  { href: "/health", demoHref: "/demo/health", label: "健康中心", short: "健康", icon: HeartPulse },
  { href: "/knowledge", demoHref: "/demo/knowledge", label: "知识空间", short: "知识", icon: BookOpen },
  { href: "/ai", demoHref: "/demo/ai", label: "AI 助手", short: "AI", icon: Bot },
  { href: "/settings", demoHref: "/demo/settings", label: "设置", short: "设置", icon: Settings },
] as const;

export const mobileMoreIcon = CircleUserRound;
