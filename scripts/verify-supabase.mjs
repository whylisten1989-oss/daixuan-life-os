import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "DX_TEST_EMAIL_A",
  "DX_TEST_EMAIL_B",
  "DX_TEST_PASSWORD_A",
  "DX_TEST_PASSWORD_B",
];

for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const emailA = process.env.DX_TEST_EMAIL_A;
const emailB = process.env.DX_TEST_EMAIL_B;
const passwordA = process.env.DX_TEST_PASSWORD_A;
const passwordB = process.env.DX_TEST_PASSWORD_B;
const newPasswordA = process.env.DX_TEST_NEW_PASSWORD_A;
const mode = process.argv[2] ?? "verify";

const client = () => createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const requireOk = (label, result) => {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
};

if (mode.startsWith("signup")) {
  const results = [];
  const accounts = [["A", emailA, passwordA], ["B", emailB, passwordB]];
  const selected = mode === "signup-a" ? accounts.slice(0, 1) : mode === "signup-b" ? accounts.slice(1) : accounts;
  for (const [label, email, password] of selected) {
    const data = requireOk(`signup ${label}`, await client().auth.signUp({ email, password, options: { data: { display_name: `Web V1 测试 ${label}` } } }));
    results.push({ account: label, userCreated: Boolean(data.user), sessionCreated: Boolean(data.session) });
  }
  console.log(JSON.stringify({ phase: "signup", results }, null, 2));
  process.exit(0);
}

if (!newPasswordA) throw new Error("Missing required environment variable: DX_TEST_NEW_PASSWORD_A");

const a = client();
const b = client();
requireOk("sign in A", await a.auth.signInWithPassword({ email: emailA, password: passwordA }));
requireOk("sign in B", await b.auth.signInWithPassword({ email: emailB, password: passwordB }));

const getSpaceId = async (supabase, label) => {
  const data = requireOk(`space ${label}`, await supabase.from("space_members").select("space_id").single());
  return data.space_id;
};

const spaceA = await getSpaceId(a, "A");
const spaceB = await getSpaceId(b, "B");
if (spaceA === spaceB) throw new Error("Test accounts unexpectedly share a personal space");

const marker = `rls-${Date.now()}`;

async function seed(supabase, spaceId, label) {
  const project = requireOk(`project ${label}`, await supabase.from("projects").insert({ space_id: spaceId, name: `${marker}-project-${label}` }).select("id").single());
  const workTask = requireOk(`work task ${label}`, await supabase.from("tasks").insert({ space_id: spaceId, project_id: project.id, title: `${marker}-work-${label}`, area: "WORK", status: "TODO", priority: "HIGH", due_at: new Date(Date.now() + 86400000).toISOString(), estimate_minutes: 45, tags: ["上线"], recurrence_rule: { frequency: "WEEKLY" } }).select("id").single());
  requireOk(`life task ${label}`, await supabase.from("tasks").insert({ space_id: spaceId, title: `${marker}-life-${label}`, area: "LIFE", status: "PLANNED", scheduled_at: new Date(Date.now() + 3600000).toISOString(), estimate_minutes: 30 }).select("id").single());
  requireOk(`subtask ${label}`, await supabase.from("tasks").insert({ space_id: spaceId, parent_id: workTask.id, title: `${marker}-subtask-${label}`, area: "WORK", status: "TODO" }).select("id").single());
  requireOk(`followup ${label}`, await supabase.from("tasks").insert({ space_id: spaceId, title: `${marker}-followup-${label}`, area: "WORK", status: "WAITING", waiting_for: `测试对象 ${label}`, next_follow_up_at: new Date().toISOString() }).select("id").single());
  const account = requireOk(`account ${label}`, await supabase.from("accounts").insert({ space_id: spaceId, name: `${marker}-account-${label}`, type: "CHECKING" }).select("id").single());
  const wallet = requireOk(`wallet ${label}`, await supabase.from("accounts").insert({ space_id: spaceId, name: `${marker}-wallet-${label}`, type: "WECHAT" }).select("id").single());
  const cardAccount = requireOk(`card account ${label}`, await supabase.from("accounts").insert({ space_id: spaceId, name: `${marker}-card-${label}`, type: "CREDIT_CARD" }).select("id").single());
  const loanAccount = requireOk(`loan account ${label}`, await supabase.from("accounts").insert({ space_id: spaceId, name: `${marker}-loan-${label}`, type: "LOAN" }).select("id").single());
  const category = requireOk(`category ${label}`, await supabase.from("finance_categories").insert({ space_id: spaceId, name: `${marker}-category-${label}`, kind: "EXPENSE" }).select("id").single());
  const incomeCategory = requireOk(`income category ${label}`, await supabase.from("finance_categories").insert({ space_id: spaceId, name: `${marker}-salary-${label}`, kind: "INCOME" }).select("id").single());
  requireOk(`transaction ${label}`, await supabase.from("transactions").insert({ space_id: spaceId, account_id: account.id, category_id: category.id, type: "EXPENSE", amount: label === "A" ? 11 : 22, occurred_at: new Date().toISOString(), note: `${marker}-finance-${label}` }).select("id").single());
  requireOk(`income ${label}`, await supabase.from("transactions").insert({ space_id: spaceId, account_id: account.id, category_id: incomeCategory.id, type: "INCOME", amount: label === "A" ? 8100 : 9200, occurred_at: new Date().toISOString(), merchant: "工资", note: `${marker}-income-${label}` }).select("id").single());
  const transferRef = crypto.randomUUID();
  requireOk(`transfer ${label}`, await supabase.from("transactions").insert([{ space_id: spaceId, account_id: account.id, type: "TRANSFER", amount: -100, occurred_at: new Date().toISOString(), note: `${marker}-transfer-${label}`, transfer_ref: transferRef }, { space_id: spaceId, account_id: wallet.id, type: "TRANSFER", amount: 100, occurred_at: new Date().toISOString(), note: `${marker}-transfer-${label}`, transfer_ref: transferRef }]));
  requireOk(`salary setting ${label}`, await supabase.from("salary_settings").insert({ space_id: spaceId, account_id: account.id, amount: label === "A" ? 8100 : 9200, pay_day: 10 }).select("id").single());
  requireOk(`budget ${label}`, await supabase.from("budgets").insert({ space_id: spaceId, category_id: category.id, month: new Date().toISOString().slice(0, 7) + "-01", amount: 3000 }));
  requireOk(`card ${label}`, await supabase.from("credit_cards").insert({ space_id: spaceId, account_id: cardAccount.id, credit_limit: 20000, statement_day: 2, repayment_day: 10 }));
  requireOk(`loan ${label}`, await supabase.from("loans").insert({ space_id: spaceId, account_id: loanAccount.id, principal: 100000, outstanding: 88000, annual_rate: 0.0325, monthly_payment: 3200, next_payment_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) }));
  requireOk(`debt payment ${label}`, await supabase.from("debt_payments").insert({ space_id: spaceId, account_id: cardAccount.id, from_account_id: account.id, kind: "CREDIT_CARD", amount: 500, note: `${marker}-repayment-${label}` }));
  requireOk(`savings ${label}`, await supabase.from("savings_goals").insert({ space_id: spaceId, name: `${marker}-savings-${label}`, target_amount: 20000, saved_amount: 5000 }));
  requireOk(`water ${label}`, await supabase.from("water_logs").insert({ space_id: spaceId, amount_ml: label === "A" ? 310 : 420 }).select("id").single());
  requireOk(`sleep ${label}`, await supabase.from("sleep_logs").insert({ space_id: spaceId, sleep_at: new Date(Date.now() - 8 * 3600000).toISOString(), wake_at: new Date().toISOString(), quality: 4, note: `${marker}-sleep-${label}` }));
  requireOk(`workout ${label}`, await supabase.from("workout_logs").insert({ space_id: spaceId, activity: "步行", duration_minutes: 35, intensity: 2, steps: 5600, feeling: 4, started_at: new Date().toISOString(), note: `${marker}-workout-${label}` }));
  requireOk(`checkin ${label}`, await supabase.from("daily_checkins").insert({ space_id: spaceId, date: new Date().toISOString().slice(0, 10), energy: 4, mood: 4, stress: 2, steps: 5600, weight_kg: 70.5, note: `${marker}-checkin-${label}` }));
  requireOk(`note ${label}`, await supabase.from("knowledge_notes").insert({ space_id: spaceId, title: `${marker}-knowledge-${label}`, content: "Preview isolation verification" }).select("id").single());
}

await seed(a, spaceA, "A");
await seed(b, spaceB, "B");

async function countOwn(supabase, table, patternColumn) {
  const result = await supabase.from(table).select("id", { count: "exact", head: true }).like(patternColumn, `${marker}%`);
  if (result.error) throw new Error(`count ${table}: ${result.error.message}`);
  return result.count;
}

async function countVisibleWater(supabase, spaces) {
  const result = await supabase.from("water_logs").select("id", { count: "exact", head: true }).in("space_id", spaces);
  if (result.error) throw new Error(`count water_logs: ${result.error.message}`);
  return result.count;
}

const isolation = {
  tasks: [await countOwn(a, "tasks", "title"), await countOwn(b, "tasks", "title")],
  finance: [await countOwn(a, "transactions", "note"), await countOwn(b, "transactions", "note")],
  health: [
    await countVisibleWater(a, [spaceA, spaceB]),
    await countVisibleWater(b, [spaceA, spaceB]),
  ],
  knowledge: [await countOwn(a, "knowledge_notes", "title"), await countOwn(b, "knowledge_notes", "title")],
};

const expected = { tasks: 4, finance: 4, health: 1, knowledge: 1 };
for (const [domain, counts] of Object.entries(isolation)) if (counts[0] !== expected[domain] || counts[1] !== expected[domain]) throw new Error(`${domain} isolation failed: ${counts.join(",")}`);

for (const [supabase, ownSpace, otherSpace, label] of [[a, spaceA, spaceB, "A"], [b, spaceB, spaceA, "B"]]) {
  const ownSalary = requireOk(`salary isolation ${label}`, await supabase.from("salary_settings").select("id", { count: "exact" }).in("space_id", [ownSpace, otherSpace]));
  if (ownSalary.length !== 1) throw new Error(`salary isolation failed ${label}`);
  const ownPayments = requireOk(`payment isolation ${label}`, await supabase.from("debt_payments").select("id", { count: "exact" }).in("space_id", [ownSpace, otherSpace]));
  if (ownPayments.length !== 1) throw new Error(`debt payment isolation failed ${label}`);
}

const crossRead = await a.from("tasks").select("id").eq("space_id", spaceB);
requireOk("cross-space read", crossRead);
if (crossRead.data.length !== 0) throw new Error("Cross-space task read returned rows");

const crossInsert = await a.from("tasks").insert({ space_id: spaceB, title: `${marker}-forbidden`, status: "TODO" });
if (!crossInsert.error) throw new Error("Cross-space task insert unexpectedly succeeded");

const wrongPassword = await client().auth.signInWithPassword({ email: emailA, password: `${passwordA}-wrong` });
if (!wrongPassword.error) throw new Error("Wrong password was unexpectedly accepted");

requireOk("password update A", await a.auth.updateUser({ password: newPasswordA }));
requireOk("sign out A", await a.auth.signOut());
const sessionAfterSignOutA = await a.auth.getSession();
if (sessionAfterSignOutA.data.session) throw new Error("A session persisted after sign out");
const oldPassword = await client().auth.signInWithPassword({ email: emailA, password: passwordA });
if (!oldPassword.error) throw new Error("Old password remained valid after update");
const newPasswordClient = client();
requireOk("new password sign in A", await newPasswordClient.auth.signInWithPassword({ email: emailA, password: newPasswordA }));
requireOk("final sign out A", await newPasswordClient.auth.signOut());

requireOk("sign out B", await b.auth.signOut());
const sessionAfterSignOutB = await b.auth.getSession();
if (sessionAfterSignOutB.data.session) throw new Error("B session persisted after sign out");

console.log(JSON.stringify({
  phase: "verify",
  passed: true,
  distinctPersonalSpaces: true,
  isolation,
  crossSpaceReadBlocked: true,
  crossSpaceInsertBlocked: true,
  wrongPasswordRejected: true,
  passwordUpdateVerified: true,
  signOutVerified: true,
}, null, 2));
