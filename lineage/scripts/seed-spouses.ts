/**
 * Seed spouse profiles — run with:  npm run seed:spouses
 *
 * Creates full `people` rows for named spouses in the family record, links
 * spouse_id both ways, marks them married_in, and sets mother_id/father_id on
 * children when possible.
 *
 * Prerequisites: migration 0003_spouse_profiles.sql applied; people already seeded.
 * Idempotent: spouse ids are deterministic from the husband's/wife's slug + name.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { getAllPeople, getPerson } from "../src/lib/family-index";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  let raw = readFileSync(filePath);
  if (raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe) {
    raw = Buffer.from(raw.toString("utf16le"));
  }
  const text = raw.toString("utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
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

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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
  b[6] = (b[6] & 0x0f) | 0x50;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = b.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseSpouseText(
  text: string
): { name: string; detail: string } | null {
  const t = text.trim();
  if (!t) return null;
  if (/^two houses:/i.test(t)) return null;
  if (/^married into\b/i.test(t)) return null;
  const m = t.match(/^([^(]+?)(?:\s*\((.+)\))?\s*$/);
  if (!m) return null;
  const name = m[1].replace(/\s+/g, " ").trim();
  const detail = (m[2] ?? "").trim();
  if (!name) return null;
  return { name, detail };
}

type SpouseSpec = {
  /** Deterministic key for UUID/slug (stable across runs). */
  key: string;
  fullName: string;
  gender: "male" | "female";
  honorific?: string;
  bio?: string | null;
  /** Bloodline partner's slug in the static record. */
  partnerSlug: string;
  /** Child slugs to set mother_id / father_id on. */
  childSlugs?: string[];
  /** Also store this text on the partner's spouse field. */
  spouseLabel?: string;
};

function buildSpouseSpecs(): SpouseSpec[] {
  const specs: SpouseSpec[] = [];
  const people = getAllPeople();

  // Matshakeni's two houses — special case before the generic loop.
  const matshakeni = getPerson("matshakeni");
  if (matshakeni) {
    const mamazibukoChildren = people
      .filter(
        (p) =>
          p.parentId === "matshakeni" && p.order?.includes("Mamazibuko")
      )
      .map((p) => p.id);
    const nomagushaChildren = people
      .filter(
        (p) =>
          p.parentId === "matshakeni" && p.order?.includes("Nomagusha")
      )
      .map((p) => p.id);

    specs.push({
      key: "spouse:matshakeni:mamazibuko",
      fullName: "Mamazibuko",
      gender: "female",
      honorific: "Married into the family",
      bio: "Of the Fiva/Matatiele house. Widow of Masole; taken as wife by Matshakeni Mphuthunywa under customary duty toward his late elder brother's household.",
      partnerSlug: "matshakeni",
      childSlugs: mamazibukoChildren,
      spouseLabel:
        "Two houses: Mamazibuko (of the Fiva/Matatiele house) and Nomagusha / Makhesa (of the Mazulu house)",
    });
    specs.push({
      key: "spouse:matshakeni:nomagusha-makhesa",
      fullName: "Nomagusha (Makhesa)",
      gender: "female",
      honorific: "Married into the family",
      bio: "Of the Mazulu house, Ludidi/Matatiele. Married Matshakeni Mphuthunywa after Chief Lidziga advised him he was not yet properly married.",
      partnerSlug: "matshakeni",
      childSlugs: nomagushaChildren,
    });
  }

  for (const person of people) {
    if (!person.spouse) continue;
    if (person.id === "matshakeni") continue;

    const parsed = parseSpouseText(person.spouse);
    if (!parsed) continue;

    const gender: "male" | "female" =
      person.gender === "female" ? "male" : "female";
    const childSlugs = people
      .filter((c) => c.parentId === person.id)
      .map((c) => c.id);

    specs.push({
      key: `spouse:${person.id}:${slugify(parsed.name)}`,
      fullName: parsed.name,
      gender,
      honorific: "Married into the family",
      bio: parsed.detail
        ? `${parsed.detail.charAt(0).toUpperCase()}${parsed.detail.slice(1)}.`
        : person.spouse,
      partnerSlug: person.id,
      childSlugs,
      spouseLabel: person.spouse,
    });
  }

  return specs;
}

async function seedSpouses(): Promise<void> {
  const specs = buildSpouseSpecs();
  console.log(`\n▸ Creating ${specs.length} spouse profiles …`);

  // Primary spouse_id on Matshakeni → Nomagusha (the later, “proper” marriage).
  // Mamazibuko is still linked via mother_id on her children and her own spouse_id.
  const primaryPartnerSpouse = new Map<string, string>([
    ["matshakeni", "spouse:matshakeni:nomagusha-makhesa"],
  ]);

  let created = 0;
  for (const spec of specs) {
    const id = deterministicUuid(spec.key);
    const partnerId = deterministicUuid(spec.partnerSlug);
    const slugBase = slugify(spec.fullName) || "spouse";
    const slug = `${slugBase}-spouse-of-${spec.partnerSlug}`.slice(0, 100);

    const { error: upsertError } = await admin.from("people").upsert(
      {
        id,
        slug,
        full_name: spec.fullName,
        gender: spec.gender,
        married_in: true,
        honorific: spec.honorific ?? "Married into the family",
        spouse_id: partnerId,
        spouse: getPerson(spec.partnerSlug)?.name ?? null,
        bio: spec.bio ?? null,
        sort_order: 9000 + created,
      },
      { onConflict: "id" }
    );
    if (upsertError) throw upsertError;
    created += 1;

    const parentField = spec.gender === "female" ? "mother_id" : "father_id";
    for (const childSlug of spec.childSlugs ?? []) {
      const { error } = await admin
        .from("people")
        .update({ [parentField]: id })
        .eq("slug", childSlug)
        .is(parentField, null);
      if (error) throw error;
    }

    const shouldLinkPartner =
      !primaryPartnerSpouse.has(spec.partnerSlug) ||
      primaryPartnerSpouse.get(spec.partnerSlug) === spec.key;

    if (shouldLinkPartner) {
      const { error } = await admin
        .from("people")
        .update({
          spouse_id: id,
          spouse: spec.spouseLabel ?? spec.fullName,
        })
        .eq("slug", spec.partnerSlug);
      if (error) throw error;
    } else {
      // Still ensure spouse text is preserved for dual-wife partners.
      if (spec.spouseLabel) {
        await admin
          .from("people")
          .update({ spouse: spec.spouseLabel })
          .eq("slug", spec.partnerSlug);
      }
    }
  }

  console.log(`  · upserted ${created} spouse profiles ✔`);
  console.log("  · linked spouse_id and parent fields on children ✔");
}

async function main() {
  await seedSpouses();
  console.log("\n✅ Spouse seed complete.\n");
}

main().catch((err) => {
  console.error("\n❌ Spouse seed failed:", err.message ?? err);
  if (
    typeof err.message === "string" &&
    (err.message.includes("spouse_id") || err.message.includes("married_in"))
  ) {
    console.error(
      "\nHint: run supabase/migrations/0003_spouse_profiles.sql in the Supabase SQL Editor first."
    );
  }
  process.exit(1);
});
