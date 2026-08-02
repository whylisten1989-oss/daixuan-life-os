"use client";

import { Download, Eye, EyeOff, Landmark, Plus, WalletCards } from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "./module-header";

const accounts = [
  { name: "日常账户", type: "储蓄卡", balance: 32480 },
  { name: "备用金", type: "现金", balance: 2800 },
  { name: "旅行储蓄", type: "目标账户", balance: 18600 },
];

const transactions = [
  { merchant: "项目回款", category: "收入", amount: 8800, time: "今天 09:12" },
  { merchant: "午餐", category: "餐饮", amount: -32, time: "今天 12:36" },
  { merchant: "地铁出行", category: "交通", amount: -8, time: "今天 08:20" },
  { merchant: "云服务订阅", category: "订阅", amount: -68, time: "8月1日" },
];

export function FinanceScreen() {
  const hidden = useUiStore((state) => state.amountsHidden);
  const toggle = useUiStore((state) => state.toggleAmounts);
  return (
    <div className="mx-auto max-w-[1380px] px-4 py-7 sm:px-6 lg:px-8">
      <ModuleHeader icon={WalletCards} title="财务中心" description="看清资金去向，为未来的选择保留余地。" action={<div className="flex gap-2"><Button variant="outline"><Download data-icon="inline-start" />CSV 导出</Button><Button><Plus data-icon="inline-start" />记录收支</Button></div>} />
      <section className="mt-7 border-y border-line-strong py-5">
        <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">本月资金概览</h2><Button variant="ghost" size="icon" aria-label={hidden ? "显示金额" : "隐藏金额"} onClick={toggle}>{hidden ? <EyeOff /> : <Eye />}</Button></div>
        <div className="mt-5 grid grid-cols-2 gap-y-5 sm:grid-cols-4 sm:divide-x sm:divide-border">
          <MoneyMetric label="收入" value={28600} hidden={hidden} tone="success" />
          <MoneyMetric label="支出" value={12850} hidden={hidden} tone="accent" />
          <MoneyMetric label="月结余" value={15750} hidden={hidden} />
          <MoneyMetric label="预算进度" value={42} hidden={false} suffix="%" />
        </div>
      </section>
      <div className="mt-7 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section><div className="flex items-center justify-between"><h2 className="font-semibold">账户</h2><button className="text-sm text-primary" type="button">管理账户</button></div><ul className="mt-3 divide-y divide-border border-t border-border">{accounts.map((account) => <li key={account.name} className="flex items-center gap-3 py-4"><div className="flex size-9 items-center justify-center rounded-md bg-surface-raised text-primary"><Landmark className="size-4" /></div><div className="flex-1"><p className="text-sm font-medium">{account.name}</p><p className="text-xs text-muted">{account.type}</p></div><span className="font-medium numeric">{formatCurrency(account.balance, hidden)}</span></li>)}</ul></section>
        <section><div className="flex items-center justify-between"><h2 className="font-semibold">最近资金流</h2><button className="text-sm text-primary" type="button">查看全部</button></div><ul className="mt-3 divide-y divide-border border-t border-border">{transactions.map((item) => <li key={`${item.merchant}-${item.time}`} className="grid grid-cols-[1fr_auto] py-4"><div><p className="text-sm font-medium">{item.merchant}</p><p className="mt-1 text-xs text-muted">{item.category} · {item.time}</p></div><span className={`font-medium numeric ${item.amount > 0 ? "text-success" : ""}`}>{item.amount > 0 ? "+" : ""}{formatCurrency(item.amount, hidden)}</span></li>)}</ul></section>
      </div>
      <section className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-3"><Plan label="即将到期" value="信用卡还款 ¥2,450" detail="8月5日" /><Plan label="储蓄目标" value="旅行基金 62%" detail="还差 ¥11,400" /><Plan label="大额计划" value="更换电脑" detail="计划 11 月" /></section>
    </div>
  );
}

function MoneyMetric({ label, value, hidden, tone, suffix }: { label: string; value: number; hidden: boolean; tone?: "success" | "accent"; suffix?: string }) { return <div className="px-2 sm:px-5"><p className="text-xs text-muted">{label}</p><p className={`mt-2 text-2xl font-medium numeric ${tone === "success" ? "text-success" : tone === "accent" ? "text-accent" : ""}`}>{suffix ? `${value}${suffix}` : formatCurrency(value, hidden)}</p></div>; }
function Plan({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="border-l-2 border-border pl-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-sm font-medium">{value}</p><p className="mt-1 text-xs text-subtle">{detail}</p></div>; }
