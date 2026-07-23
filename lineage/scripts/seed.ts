/**
 * Seed script — run with:  npm run seed
 *
 * 1. Creates (or reuses) your admin auth user from ADMIN_EMAIL / ADMIN_PASSWORD
 *    in .env.local and grants it the `admin` role.
 * 2. Loads every person from the original family record into `public.people`,
 *    wiring up father/mother links.
 *
 * Idempotent: safe to run more than once. Person ids are derived deterministically
 * from their slug, so re-running updates rows in place instead of duplicating.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { getAllPeople, getPerson } from "../src/lib/family-index";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- Load .env.local -------------------------------------------------------
function loadEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  // Strip BOM; also handle UTF-16 LE that some Windows editors write by mistake.
  let raw = readFileSync(filePath);
  if (raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe) {
    raw = Buffer.from(raw.toString("utf16le"));
  }
  const text = raw.toString("utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    // Drop invisible / zero-width chars that editors sometimes insert.
    const cleaned = line.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
    if (!cleaned || cleaned.startsWith("#")) continue;
    const eq = cleaned.indexOf("=");
    if (eq === -1) continue;
    const key = cleaned.slice(0, eq).trim();
    let value = cleaned.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const envPath = resolve(__dirname, "..", ".env.local");
const env = loadEnvFile(envPath);
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = env.ADMIN_EMAIL;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;
const ADMIN_NAME = env.ADMIN_NAME ?? "Family Admin";

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error(`  Reading: ${envPath}`);
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Admin credentials not found in .env.local.");
  console.error(`  File: ${envPath}`);
  console.error(`  ADMIN_EMAIL: ${ADMIN_EMAIL ? "set" : "missing/empty"}`);
  console.error(`  ADMIN_PASSWORD: ${ADMIN_PASSWORD ? "set" : "missing/empty"}`);
  console.error(
    "Save the file (Ctrl+S), then run `npm run seed` again. Values must be on the same line as the key, with no spaces around =."
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---- Deterministic UUID (v5-style) from a slug -----------------------------
const NAMESPACE = "6f9619ff-8b86-d011-b42d-00c04fc964ff";
function deterministicUuid(name: string): string {
  const nsBytes = NAMESPACE.replace(/-/g, "").match(/.{2}/g)!.map((h) =>
    parseInt(h, 16)
  );
  const hash = createHash("sha1")
    .update(Buffer.from(nsBytes))
    .update(name)
    .digest();
  const b = Buffer.from(hash.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50; // version 5
  b[8] = (b[8] & 0x3f) | 0x80; // variant
  const hex = b.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function seedAdmin(): Promise<void> {
  console.log(`\n▸ Ensuring admin account for ${ADMIN_EMAIL} …`);
  const { data: created, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: ADMIN_NAME },
  });

  let userId = created?.user?.id;
  if (error) {
    // Likely already exists — find them by listing users.
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existing = list?.users.find(
      (u) => u.email?.toLowerCase() === ADMIN_EMAIL!.toLowerCase()
    );
    if (!existing) throw error;
    userId = existing.id;
    // Refresh the password so the known credentials always work.
    await admin.auth.admin.updateUserById(userId, { password: ADMIN_PASSWORD });
    console.log("  · account already existed — password reset to match .env.local");
  } else {
    console.log("  · account created");
  }

  const { error: roleError } = await admin
    .from("profiles")
    .upsert({ id: userId!, display_name: ADMIN_NAME, role: "admin" });
  if (roleError) throw roleError;
  console.log("  · role set to admin ✔");
}

async function seedPeople(): Promise<void> {
  const people = getAllPeople();
  console.log(`\n▸ Seeding ${people.length} people …`);

  // Pass 1: upsert every person (without parent links).
  // sort_order follows the record's natural reading order (eldest first).
  const rows = people.map((p, i) => ({
    id: deterministicUuid(p.id),
    slug: p.id,
    full_name: p.name,
    gender: p.gender,
    honorific: p.order ?? null,
    house: p.branchLabel ?? null,
    spouse: p.spouse ?? null,
    bio: p.note ?? null,
    sort_order: i,
  }));

  const { error: upsertError } = await admin
    .from("people")
    .upsert(rows, { onConflict: "slug" });
  if (upsertError) throw upsertError;
  console.log("  · people upserted ✔");

  // Pass 2: set father_id / mother_id based on each parent's gender.
  let linked = 0;
  for (const p of people) {
    if (!p.parentId) continue;
    const parent = getPerson(p.parentId);
    if (!parent) continue;
    const parentUuid = deterministicUuid(parent.id);
    const patch =
      parent.gender === "female"
        ? { mother_id: parentUuid }
        : { father_id: parentUuid };
    const { error } = await admin
      .from("people")
      .update(patch)
      .eq("slug", p.id);
    if (error) throw error;
    linked += 1;
  }
  console.log(`  · linked ${linked} parent relationships ✔`);
}

async function main() {
  await seedAdmin();
  await seedPeople();
  console.log("\n✅ Seed complete.\n");
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message ?? err);
  process.exit(1);
});
