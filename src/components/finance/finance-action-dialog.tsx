"use client";

import { useState } from "react";
import { FormField, FormStatus, Select, Textarea } from "@/components/forms/form-controls";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFinanceActions } from "@/hooks/use-finance";
import { localDateKey } from "@/lib/date";
import type { FinanceData } from "@/types/life";

export type FinanceAction = "expense" | "income" | "transfer" | "account" | "salary" | "category" | "budget" | "recurring" | "subscription" | "creditCard" | "loan" | "goal" | "plan" | "repay";

const titles: Record<FinanceAction, string> = {
  expense: "记支出", income: "记收入", transfer: "账户转账", account: "新增账户", salary: "每月工资设置", category: "新增分类",
  budget: "设置月度预算", recurring: "新增固定支出", subscription: "新增订阅", creditCard: "添加信用卡", loan: "添加贷款",
  goal: "新建储蓄目标", plan: "新建大额消费计划", repay: "记录还款",
};

const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const numberValue = (form: FormData, key: string) => Number(value(form, key));

export function FinanceActionDialog({ action, onOpenChange, spaceId, data }: { action: FinanceAction | null; onOpenChange: (open: boolean) => void; spaceId?: string; data: FinanceData }) {
  const actions = useFinanceActions(spaceId);
  const [error, setError] = useState("");
  const pending = actions.insert.isPending || actions.update.isPending || actions.transfer.isPending || actions.upsertSalary.isPending;
  const accounts = data.accounts.filter((account) => !account.is_archived);
  const categories = data.categories.filter((category) => !action || category.kind === (action === "income" ? "INCOME" : "EXPENSE"));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!action) return;
    const form = new FormData(event.currentTarget);
    setError("");
    try {
      if (action === "expense" || action === "income") {
        const amount = numberValue(form, "amount");
        if (!amount || !value(form, "accountId")) throw new Error("请填写金额并选择账户");
        await actions.insert.mutateAsync({ table: "transactions", values: { account_id: value(form, "accountId"), category_id: value(form, "categoryId") || null, type: action === "income" ? "INCOME" : "EXPENSE", amount: Math.abs(amount), occurred_at: new Date(value(form, "occurredAt")).toISOString(), merchant: value(form, "merchant") || null, note: value(form, "note") || null } });
      } else if (action === "transfer") {
        if (value(form, "fromId") === value(form, "toId")) throw new Error("转出和转入账户不能相同");
        await actions.transfer.mutateAsync({ fromId: value(form, "fromId"), toId: value(form, "toId"), amount: numberValue(form, "amount"), occurredAt: new Date(value(form, "occurredAt")).toISOString(), note: value(form, "note") });
      } else if (action === "account") {
        await actions.insert.mutateAsync({ table: "accounts", values: { name: value(form, "name"), type: value(form, "type"), currency: "CNY", opening_balance: numberValue(form, "openingBalance") || 0 } });
      } else if (action === "salary") {
        await actions.upsertSalary.mutateAsync({ account_id: value(form, "accountId"), amount: numberValue(form, "amount"), pay_day: numberValue(form, "payDay"), is_active: true });
      } else if (action === "category") {
        await actions.insert.mutateAsync({ table: "finance_categories", values: { name: value(form, "name"), kind: value(form, "kind"), color: value(form, "color") || "stone" } });
      } else if (action === "budget") {
        await actions.insert.mutateAsync({ table: "budgets", values: { category_id: value(form, "categoryId"), month: `${value(form, "month")}-01`, amount: numberValue(form, "amount") } });
      } else if (action === "recurring" || action === "subscription") {
        await actions.insert.mutateAsync({ table: action === "recurring" ? "recurring_expenses" : "subscriptions", values: { name: value(form, "name"), amount: numberValue(form, "amount"), cadence: value(form, "cadence"), next_due_at: value(form, "nextDueAt"), ...(action === "subscription" ? { status: "ACTIVE" } : { is_active: true }) } });
      } else if (action === "creditCard") {
        await actions.insert.mutateAsync({ table: "credit_cards", values: { account_id: value(form, "accountId"), credit_limit: numberValue(form, "creditLimit"), statement_day: numberValue(form, "statementDay"), repayment_day: numberValue(form, "repaymentDay") } });
      } else if (action === "loan") {
        await actions.insert.mutateAsync({ table: "loans", values: { account_id: value(form, "accountId"), principal: numberValue(form, "principal"), outstanding: numberValue(form, "outstanding"), annual_rate: numberValue(form, "annualRate") / 100, monthly_payment: numberValue(form, "monthlyPayment"), next_payment_at: value(form, "nextPaymentAt") } });
      } else if (action === "goal") {
        await actions.insert.mutateAsync({ table: "savings_goals", values: { name: value(form, "name"), target_amount: numberValue(form, "targetAmount"), saved_amount: numberValue(form, "savedAmount") || 0, target_date: value(form, "targetDate") || null } });
      } else if (action === "plan") {
        await actions.insert.mutateAsync({ table: "purchase_plans", values: { name: value(form, "name"), target_amount: numberValue(form, "targetAmount"), planned_at: value(form, "plannedAt") || null, priority: numberValue(form, "priority") || 0, status: "PLANNING" } });
      } else if (action === "repay") {
        const targetId = value(form, "targetId");
        const sourceId = value(form, "sourceId");
        const amount = numberValue(form, "amount");
        const kind = value(form, "kind") as "CREDIT_CARD" | "LOAN";
        await actions.insert.mutateAsync({ table: "debt_payments", values: { account_id: targetId, from_account_id: sourceId, kind, amount, paid_at: new Date(value(form, "paidAt")).toISOString(), note: value(form, "note") || null } });
        await actions.insert.mutateAsync({ table: "transactions", values: { account_id: sourceId, type: "EXPENSE", amount, occurred_at: new Date(value(form, "paidAt")).toISOString(), merchant: kind === "LOAN" ? "贷款还款" : "信用卡还款", note: value(form, "note") || null } });
        const loan = data.loans.find((item) => String(item.account_id) === targetId);
        if (kind === "LOAN" && loan) await actions.update.mutateAsync({ table: "loans", id: String(loan.id), values: { outstanding: Math.max(0, Number(loan.outstanding) - amount) } });
      }
      onOpenChange(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "保存失败"); }
  };

  return (
    <Dialog open={Boolean(action)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:w-[min(92vw,680px)]">
        <DialogHeader><DialogTitle>{action ? titles[action] : "财务记录"}</DialogTitle><DialogDescription>所有金额使用人民币，记录只写入当前个人空间。</DialogDescription></DialogHeader>
        {action ? <form onSubmit={submit}><div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6"><ActionFields action={action} accounts={accounts} categories={categories} data={data} /><FormStatus danger>{error}</FormStatus></div><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button type="submit" disabled={pending}>{pending ? "保存中…" : "确认保存"}</Button></DialogFooter></form> : null}
      </DialogContent>
    </Dialog>
  );
}

function ActionFields({ action, accounts, categories, data }: { action: FinanceAction; accounts: FinanceData["accounts"]; categories: FinanceData["categories"]; data: FinanceData }) {
  const now = new Date();
  const dateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  if (action === "expense" || action === "income") return <><AccountSelect accounts={accounts} /><FormField label="金额（元）"><Input name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" required /></FormField><FormField label="分类"><Select name="categoryId"><option value="">暂不分类</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField><FormField label={action === "income" ? "来源" : "商户或用途"}><Input name="merchant" placeholder={action === "income" ? "例如：工资" : "例如：午餐"} /></FormField><FormField label="发生时间"><Input name="occurredAt" type="datetime-local" defaultValue={dateTime} required /></FormField><FormField label="备注"><Input name="note" /></FormField></>;
  if (action === "transfer") return <><FormField label="转出账户"><Select name="fromId" required><option value="">请选择</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField><FormField label="转入账户"><Select name="toId" required><option value="">请选择</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField><FormField label="金额（元）"><Input name="amount" type="number" min="0.01" step="0.01" required /></FormField><FormField label="转账时间"><Input name="occurredAt" type="datetime-local" defaultValue={dateTime} required /></FormField><FormField label="备注" className="sm:col-span-2"><Textarea name="note" /></FormField></>;
  if (action === "account") return <><FormField label="账户名称"><Input name="name" required /></FormField><FormField label="账户类型"><Select name="type"><option value="CHECKING">银行卡</option><option value="WECHAT">微信</option><option value="ALIPAY">支付宝</option><option value="CASH">现金</option><option value="CREDIT_CARD">信用卡</option><option value="CUSTOM">自定义</option></Select></FormField><FormField label="初始余额"><Input name="openingBalance" type="number" step="0.01" defaultValue="0" /></FormField></>;
  if (action === "salary") return <><FormField label="每月工资"><Input name="amount" type="number" min="0.01" step="0.01" defaultValue={data.salarySetting?.amount} required /></FormField><FormField label="发薪日"><Input name="payDay" type="number" min="1" max="31" defaultValue={data.salarySetting?.pay_day ?? 10} required /></FormField><AccountSelect accounts={accounts} defaultValue={data.salarySetting?.account_id} label="到账账户" /></>;
  if (action === "category") return <><FormField label="分类名称"><Input name="name" required /></FormField><FormField label="类型"><Select name="kind"><option value="EXPENSE">支出</option><option value="INCOME">收入</option></Select></FormField><FormField label="颜色语义"><Select name="color"><option value="stone">中性</option><option value="jade">绿色</option><option value="amber">金色</option></Select></FormField></>;
  if (action === "budget") return <><FormField label="支出分类"><Select name="categoryId" required><option value="">请选择</option>{data.categories.filter((item) => item.kind === "EXPENSE").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField><FormField label="月份"><Input name="month" type="month" defaultValue={localDateKey().slice(0, 7)} required /></FormField><FormField label="预算金额"><Input name="amount" type="number" min="0.01" step="0.01" required /></FormField></>;
  if (action === "recurring" || action === "subscription") return <><FormField label="名称"><Input name="name" required /></FormField><FormField label="金额"><Input name="amount" type="number" min="0.01" step="0.01" required /></FormField><FormField label="周期"><Select name="cadence"><option value="MONTHLY">每月</option><option value="YEARLY">每年</option><option value="WEEKLY">每周</option></Select></FormField><FormField label="下次到期"><Input name="nextDueAt" type="date" defaultValue={localDateKey()} required /></FormField></>;
  if (action === "creditCard") return <><AccountSelect accounts={accounts.filter((item) => item.type === "CREDIT_CARD")} label="信用卡账户" /><FormField label="信用额度"><Input name="creditLimit" type="number" min="1" required /></FormField><FormField label="账单日"><Input name="statementDay" type="number" min="1" max="31" required /></FormField><FormField label="还款日"><Input name="repaymentDay" type="number" min="1" max="31" required /></FormField></>;
  if (action === "loan") return <><AccountSelect accounts={accounts.filter((item) => item.type === "LOAN" || item.type === "CUSTOM")} label="贷款账户" /><FormField label="贷款本金"><Input name="principal" type="number" min="1" required /></FormField><FormField label="当前剩余"><Input name="outstanding" type="number" min="0" required /></FormField><FormField label="年利率（%）"><Input name="annualRate" type="number" min="0" step="0.01" required /></FormField><FormField label="每月还款"><Input name="monthlyPayment" type="number" min="0.01" required /></FormField><FormField label="下次还款"><Input name="nextPaymentAt" type="date" defaultValue={localDateKey()} required /></FormField></>;
  if (action === "goal") return <><FormField label="目标名称"><Input name="name" required /></FormField><FormField label="目标金额"><Input name="targetAmount" type="number" min="1" required /></FormField><FormField label="已存金额"><Input name="savedAmount" type="number" min="0" defaultValue="0" /></FormField><FormField label="目标日期"><Input name="targetDate" type="date" /></FormField></>;
  if (action === "plan") return <><FormField label="计划名称"><Input name="name" required /></FormField><FormField label="预计金额"><Input name="targetAmount" type="number" min="1" required /></FormField><FormField label="计划日期"><Input name="plannedAt" type="date" /></FormField><FormField label="优先级"><Input name="priority" type="number" min="0" max="5" defaultValue="1" /></FormField></>;
  return <><FormField label="类型"><Select name="kind"><option value="CREDIT_CARD">信用卡还款</option><option value="LOAN">贷款还款</option></Select></FormField><FormField label="还款目标"><Select name="targetId" required><option value="">请选择</option>{accounts.filter((item) => item.type === "CREDIT_CARD" || item.type === "LOAN" || item.type === "CUSTOM").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField><FormField label="还款账户"><Select name="sourceId" required><option value="">请选择</option>{accounts.filter((item) => item.type !== "CREDIT_CARD" && item.type !== "LOAN").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField><FormField label="还款金额"><Input name="amount" type="number" min="0.01" step="0.01" required /></FormField><FormField label="还款时间"><Input name="paidAt" type="datetime-local" defaultValue={dateTime} required /></FormField><FormField label="备注"><Input name="note" /></FormField></>;
}

function AccountSelect({ accounts, defaultValue, label = "账户" }: { accounts: FinanceData["accounts"]; defaultValue?: string; label?: string }) {
  return <FormField label={label}><Select name="accountId" defaultValue={defaultValue ?? ""} required><option value="">请选择</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField>;
}
