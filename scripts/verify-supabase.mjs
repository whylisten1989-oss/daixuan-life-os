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
    const data = requireOk(`signup ${label}`, await client().auth.signUp({ email, password }));
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
  requireOk(`task ${label}`, await supabase.from("tasks").insert({ space_id: spaceId, title: `${marker}-task-${label}`, status: "TODO" }).select("id").single());
  const account = requireOk(`account ${label}`, await supabase.from("accounts").insert({ space_id: spaceId, name: `${marker}-account-${label}`, type: "CHECKING" }).select("id").single());
  const category = requireOk(`category ${label}`, await supabase.from("finance_categories").insert({ space_id: spaceId, name: `${marker}-category-${label}`, kind: "EXPENSE" }).select("id").single());
  requireOk(`transaction ${label}`, await supabase.from("transactions").insert({ space_id: spaceId, account_id: account.id, category_id: category.id, type: "EXPENSE", amount: label === "A" ? 11 : 22, occurred_at: new Date().toISOString(), note: `${marker}-finance-${label}` }).select("id").single());
  requireOk(`water ${label}`, await supabase.from("water_logs").insert({ space_id: spaceId, amount_ml: label === "A" ? 310 : 420 }).select("id").single());
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

for (const [domain, counts] of Object.entries(isolation)) {
  if (counts[0] !== 1 || counts[1] !== 1) throw new Error(`${domain} isolation failed: ${counts.join(",")}`);
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
