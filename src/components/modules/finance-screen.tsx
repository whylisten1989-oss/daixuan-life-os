"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Download, Eye, EyeOff, Landmark, Plus, ReceiptText, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { FinanceActionDialog, type FinanceAction } from "@/components/finance/finance-action-dialog";
import { Button } from "@/components/ui/button";
import { useFinance, useFinanceActions } from "@/hooks/use-finance";
import { useWorkspace } from "@/hooks/use-workspace";
import { localDateKey } from "@/lib/date";
import { formatCurrency } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { AccountRecord, FinanceData } from "@/types/life";
import { ModuleHeader } from "./module-header";

const FinanceTrend = dynamic(() => import("@/components/finance/finance-trend"), { ssr: false, loading: () => <div className="h-52 animate-pulse bg-surface-raised" /> });
const sections = ["概览", "资金流", "账户与工资", "预算与固定项", "信用与贷款", "目标计划"] as const;
const accountLabels: Record<AccountRecord["type"], string> = { CASH: "现金", CHECKING: "银行卡", SAVINGS: "储蓄账户", WECHAT: "微信", ALIPAY: "支付宝", CREDIT_CARD: "信用卡", LOAN: "贷款", INVESTMENT: "投资", CUSTOM: "自定义", OTHER: "其他" };

function emptyFinance(): FinanceData { return { accounts: [], categories: [], transactions: [], budgets: [], recurringExpenses: [], subscriptions: [], creditCards: [], loans: [], savingsGoals: [], purchasePlans: [], salarySetting: null, debtPayments: [] }; }

export function FinanceScreen() {
  const workspace = useWorkspace();
  const finance = useFinance(workspace.data?.spaceId);
  const actions = useFinanceActions(workspace.data?.spaceId);
  const [section, setSection] = useState<(typeof sections)[number]>("概览");
  const [action, setAction] = useState<FinanceAction | null>(null);
  const [salaryPending, setSalaryPending] = useState(false);
  const hidden = useUiStore((state) => state.amountsHidden);
  const toggle = useUiStore((state) => state.toggleAmounts);
  const data = finance.data ?? emptyFinance();
  const month = localDateKey().slice(0, 7);
  const monthTransactions = data.transactions.filter((item) => item.occurred_at.startsWith(month));
  const income = monthTransactions.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = monthTransactions.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + Number(item.amount), 0);
  const budgetTotal = data.budgets.filter((item) => String(item.month).startsWith(month)).reduce((sum, item) => sum + Number(item.amount), 0);
  const savingsTotal = data.savingsGoals.reduce((sum, item) => sum + Number(item.saved_amount), 0);
  const savingsTarget = data.savingsGoals.reduce((sum, item) => sum + Number(item.target_amount), 0);
  const balances = useMemo(() => new Map(data.accounts.map((account) => {
    const delta = data.transactions.filter((item) => item.account_id === account.id).reduce((sum, item) => sum + (item.type === "INCOME" ? Number(item.amount) : item.type === "EXPENSE" ? -Number(item.amount) : Number(item.amount)), 0);
    return [account.id, Number(account.opening_balance) + delta];
  })), [data.accounts, data.transactions]);

  const exportCsv = () => {
    const rows = [["日期", "类型", "账户", "金额", "商户或来源", "备注"], ...data.transactions.map((item) => [item.occurred_at, item.type, data.accounts.find((account) => account.id === item.account_id)?.name ?? "", item.amount, item.merchant ?? "", item.note ?? ""] )];
    const blob = new Blob([`\ufeff${rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")}`], { type: "text/csv;charset=utf-8" });
    const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(blob); anchor.download = `daixuan-finance-${localDateKey()}.csv`; anchor.click(); URL.revokeObjectURL(anchor.href);
  };

  const markSalaryReceived = async () => {
    if (!data.salarySetting || salaryPending) return;
    setSalaryPending(true);
    try {
      await actions.insert.mutateAsync({ table: "transactions", values: { account_id: data.salarySetting.account_id, type: "INCOME", amount: data.salarySetting.amount, occurred_at: new Date().toISOString(), merchant: "工资", note: "每月工资到账" } });
      await actions.update.mutateAsync({ table: "salary_settings", id: data.salarySetting.id, values: { last_received_month: `${month}-01`, last_received_at: new Date().toISOString() } });
      await finance.refetch();
    } finally {
      setSalaryPending(false);
    }
  };

  if (finance.isLoading) return <div className="app-page"><div className="h-48 animate-pulse bg-surface-raised" /></div>;
  if (finance.error) return <div className="app-page text-danger">财务数据加载失败：{finance.error.message}</div>;

  return (
    <div className="app-page">
      <ModuleHeader icon={WalletCards} title="财务中心" description="以工资和日常开销为主线，管理账户、负债与储蓄。" action={<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={exportCsv}><Download data-icon="inline-start" />CSV</Button><Button onClick={() => setAction("expense")}><Plus data-icon="inline-start" />记一笔</Button></div>} />
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border scrollbar-none">{sections.map((item) => <button key={item} onClick={() => setSection(item)} className={`min-h-11 shrink-0 border-b-2 px-3 text-sm ${section === item ? "border-primary text-foreground" : "border-transparent text-muted"}`} type="button">{item}</button>)}</div>

      <section className="finance-command-strip"><QuickAction icon={ArrowDownLeft} label="记支出" onClick={() => setAction("expense")} /><QuickAction icon={ArrowUpRight} label="记收入" onClick={() => setAction("income")} /><QuickAction icon={ArrowLeftRight} label="账户转账" onClick={() => setAction("transfer")} /><span className="ml-auto hidden text-xs text-muted sm:block">默认货币 CNY</span></section>

      <AnimatePresence mode="wait">
        <motion.div key={section} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {section === "概览" ? <Overview data={data} hidden={hidden} toggle={toggle} income={income} expense={expense} budgetTotal={budgetTotal} savingsTotal={savingsTotal} savingsTarget={savingsTarget} setAction={setAction} /> : null}
          {section === "资金流" ? <Transactions data={data} hidden={hidden} /> : null}
          {section === "账户与工资" ? <Accounts data={data} balances={balances} hidden={hidden} setAction={setAction} onSalaryReceived={markSalaryReceived} salaryPending={salaryPending} /> : null}
          {section === "预算与固定项" ? <Fixed data={data} hidden={hidden} setAction={setAction} /> : null}
          {section === "信用与贷款" ? <Debts data={data} hidden={hidden} setAction={setAction} /> : null}
          {section === "目标计划" ? <Goals data={data} hidden={hidden} setAction={setAction} /> : null}
        </motion.div>
      </AnimatePresence>
      <FinanceActionDialog action={action} onOpenChange={(open) => { if (!open) setAction(null); }} spaceId={workspace.data?.spaceId} data={data} />
    </div>
  );
}

function Overview({ data, hidden, toggle, income, expense, budgetTotal, savingsTotal, savingsTarget, setAction }: { data: FinanceData; hidden: boolean; toggle: () => void; income: number; expense: number; budgetTotal: number; savingsTotal: number; savingsTarget: number; setAction: (action: FinanceAction) => void }) {
  const upcoming = [...data.recurringExpenses, ...data.subscriptions, ...data.loans].sort((a, b) => String(a.next_due_at ?? a.next_payment_at).localeCompare(String(b.next_due_at ?? b.next_payment_at))).slice(0, 4);
  return <><section className="metric-band"><div className="flex items-center justify-between sm:col-span-4"><h2>本月资金概览</h2><Button variant="ghost" size="icon" aria-label={hidden ? "显示金额" : "隐藏金额"} onClick={toggle}>{hidden ? <EyeOff /> : <Eye />}</Button></div><Money label="工资或收入" value={income} hidden={hidden} tone="success" /><Money label="本月支出" value={expense} hidden={hidden} tone="accent" /><Money label="剩余预算" value={Math.max(0, budgetTotal - expense)} hidden={hidden} /><Money label="储蓄进度" value={savingsTarget ? savingsTotal / savingsTarget * 100 : 0} hidden={false} suffix="%" /></section><div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]"><section><div className="section-heading"><h2>最近 30 天支出趋势</h2><span>按日汇总</span></div><FinanceTrend transactions={data.transactions} /></section><section><div className="section-heading"><h2>近期账单与还款</h2><Button size="sm" variant="ghost" onClick={() => setAction("repay")}>记录还款</Button></div>{upcoming.length ? <ul className="divide-y divide-border">{upcoming.map((item) => <li key={String(item.id)} className="data-row"><span><strong>{String(item.name ?? "还款")}</strong><small>{String(item.next_due_at ?? item.next_payment_at ?? "")}</small></span><b>{formatCurrency(Number(item.amount ?? item.monthly_payment), hidden)}</b></li>)}</ul> : <SmallEmpty text="还没有近期账单" />}</section></div></>;
}

function Transactions({ data, hidden }: { data: FinanceData; hidden: boolean }) { return <section className="mt-7"><div className="section-heading"><h2>全部资金流</h2><span>{data.transactions.length} 笔</span></div>{data.transactions.length ? <ul className="divide-y divide-border">{data.transactions.map((item) => <li key={item.id} className="data-row"><span><strong>{item.merchant || (item.type === "TRANSFER" ? "账户转账" : "未命名记录")}</strong><small>{new Date(item.occurred_at).toLocaleString("zh-CN")} · {data.accounts.find((account) => account.id === item.account_id)?.name}</small></span><b className={item.type === "INCOME" ? "text-success" : item.type === "EXPENSE" ? "text-accent" : ""}>{item.type === "INCOME" ? "+" : item.type === "EXPENSE" ? "−" : ""}{formatCurrency(Math.abs(item.amount), hidden)}</b></li>)}</ul> : <SmallEmpty text="记录第一笔收入或支出后，资金流会出现在这里" />}</section>; }

function Accounts({ data, balances, hidden, setAction, onSalaryReceived, salaryPending }: { data: FinanceData; balances: Map<string, number>; hidden: boolean; setAction: (action: FinanceAction) => void; onSalaryReceived: () => void; salaryPending: boolean }) { const received = data.salarySetting?.last_received_month?.startsWith(localDateKey().slice(0, 7)); return <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_0.72fr]"><section><div className="section-heading"><h2>账户</h2><Button size="sm" variant="outline" onClick={() => setAction("account")}><Plus data-icon="inline-start" />新增</Button></div>{data.accounts.length ? <ul className="divide-y divide-border">{data.accounts.map((item) => <li key={item.id} className="data-row"><span className="flex items-center gap-3"><i className="surface-icon"><Landmark /></i><span><strong>{item.name}</strong><small>{accountLabels[item.type]} · CNY</small></span></span><b>{formatCurrency(balances.get(item.id) ?? 0, hidden)}</b></li>)}</ul> : <SmallEmpty text="先创建银行卡、微信或支付宝账户" />}</section><section className="finance-side-panel"><div className="section-heading"><h2>每月工资</h2><Button size="sm" variant="ghost" onClick={() => setAction("salary")}>设置</Button></div>{data.salarySetting ? <><p className="mt-5 text-4xl font-medium numeric">{formatCurrency(data.salarySetting.amount, hidden)}</p><p className="mt-2 text-sm text-muted">每月 {data.salarySetting.pay_day} 日 · {data.accounts.find((item) => item.id === data.salarySetting?.account_id)?.name}</p><Button className="mt-6 w-full" variant={received ? "outline" : "default"} disabled={Boolean(received) || salaryPending} onClick={onSalaryReceived}>{salaryPending ? "记录中…" : received ? "本月已到账" : "标记本月已到账"}</Button></> : <SmallEmpty text="设置工资金额、发薪日和到账账户" />}</section></div>; }

function Fixed({ data, hidden, setAction }: { data: FinanceData; hidden: boolean; setAction: (action: FinanceAction) => void }) { return <div className="mt-7 grid gap-8 lg:grid-cols-3"><Collection title="月度预算" rows={data.budgets} empty="还没有预算" action="设置预算" onClick={() => setAction("budget")} amountKey="amount" hidden={hidden} /><Collection title="固定支出" rows={data.recurringExpenses} empty="还没有固定支出" action="新增" onClick={() => setAction("recurring")} amountKey="amount" hidden={hidden} /><Collection title="订阅" rows={data.subscriptions} empty="还没有订阅" action="新增" onClick={() => setAction("subscription")} amountKey="amount" hidden={hidden} /><Button variant="ghost" className="w-fit" onClick={() => setAction("category")}>管理收支分类</Button></div>; }
function Debts({ data, hidden, setAction }: { data: FinanceData; hidden: boolean; setAction: (action: FinanceAction) => void }) { return <div className="mt-7"><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setAction("creditCard")}>添加信用卡</Button><Button variant="outline" onClick={() => setAction("loan")}>添加贷款</Button><Button onClick={() => setAction("repay")}>记录还款</Button></div><div className="mt-7 grid gap-8 lg:grid-cols-2"><Collection title="信用卡与账单" rows={data.creditCards} empty="添加信用卡账户后管理账单日和还款日" amountKey="credit_limit" hidden={hidden} /><Collection title="贷款" rows={data.loans} empty="还没有贷款记录" amountKey="outstanding" hidden={hidden} /></div></div>; }
function Goals({ data, hidden, setAction }: { data: FinanceData; hidden: boolean; setAction: (action: FinanceAction) => void }) { return <div className="mt-7 grid gap-8 lg:grid-cols-2"><Collection title="储蓄目标" rows={data.savingsGoals} empty="建立第一个储蓄目标" action="新建目标" onClick={() => setAction("goal")} amountKey="target_amount" hidden={hidden} /><Collection title="大额消费计划" rows={data.purchasePlans} empty="规划需要提前准备的大额消费" action="新建计划" onClick={() => setAction("plan")} amountKey="target_amount" hidden={hidden} /></div>; }

function Collection({ title, rows, empty, action, onClick, amountKey, hidden }: { title: string; rows: Record<string, unknown>[]; empty: string; action?: string; onClick?: () => void; amountKey: string; hidden: boolean }) { return <section><div className="section-heading"><h2>{title}</h2>{action ? <Button size="sm" variant="ghost" onClick={onClick}>{action}</Button> : null}</div>{rows.length ? <ul className="divide-y divide-border">{rows.map((item) => <li key={String(item.id)} className="data-row"><span><strong>{String(item.name ?? item.kind ?? title)}</strong><small>{String(item.next_due_at ?? item.next_payment_at ?? item.target_date ?? item.month ?? "")}</small></span><b>{formatCurrency(Number(item[amountKey]), hidden)}</b></li>)}</ul> : <SmallEmpty text={empty} />}</section>; }
function Money({ label, value, hidden, tone, suffix }: { label: string; value: number; hidden: boolean; tone?: "success" | "accent"; suffix?: string }) { return <div><p className="text-xs text-muted">{label}</p><p className={`mt-2 text-2xl font-medium numeric ${tone === "success" ? "text-success" : tone === "accent" ? "text-accent" : ""}`}>{suffix ? `${value.toFixed(0)}${suffix}` : formatCurrency(value, hidden)}</p></div>; }
function QuickAction({ icon: Icon, label, onClick }: { icon: typeof Plus; label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex min-h-10 items-center gap-2 px-3 text-sm hover:bg-surface-raised"><Icon className="size-4 text-primary" />{label}</button>; }
function SmallEmpty({ text }: { text: string }) { return <div className="py-8 text-sm text-muted"><ReceiptText className="mb-3 size-5 text-subtle" />{text}</div>; }
