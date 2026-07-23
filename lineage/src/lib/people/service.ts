import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseUrl } from "@/lib/supabase/env";
import type { PersonRow, Gender } from "@/lib/supabase/types";

export type { PersonRow, Gender } from "@/lib/supabase/types";

export interface Person extends PersonRow {
  imageUrl: string | null;
}

/** Public URL for an object stored in the `media` bucket. */
export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  return `${getSupabaseUrl()}/storage/v1/object/public/media/${path}`;
}

interface FamilyData {
  people: Person[];
  byId: Map<string, Person>;
  bySlug: Map<string, Person>;
  childrenByParent: Map<string, Person[]>;
}

/**
 * Load the whole family once per request. The dataset is small (~hundreds of
 * rows), so we fetch it all and compute relationships in memory. `cache()`
 * dedupes the query across a single render pass.
 */
export const getFamilyData = cache(async (): Promise<FamilyData> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("full_name", { ascending: true });
  if (error) throw error;

  const people: Person[] = ((data ?? []) as PersonRow[]).map((row) => ({
    ...row,
    imageUrl: mediaUrl(row.image_path),
  }));

  const byId = new Map(people.map((p) => [p.id, p]));
  const bySlug = new Map(people.map((p) => [p.slug, p]));
  const childrenByParent = new Map<string, Person[]>();
  const addChild = (parentId: string | null, child: Person) => {
    if (!parentId) return;
    const list = childrenByParent.get(parentId) ?? [];
    if (!list.some((c) => c.id === child.id)) list.push(child);
    childrenByParent.set(parentId, list);
  };
  for (const person of people) {
    addChild(person.father_id, person);
    addChild(person.mother_id, person);
  }

  return { people, byId, bySlug, childrenByParent };
});

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export async function getAllPeople(): Promise<Person[]> {
  return (await getFamilyData()).people;
}

export async function getPersonBySlug(
  slug: string
): Promise<Person | undefined> {
  return (await getFamilyData()).bySlug.get(slug);
}

export async function getPersonById(id: string): Promise<Person | undefined> {
  return (await getFamilyData()).byId.get(id);
}

export async function getChildren(person: Person): Promise<Person[]> {
  return (await getFamilyData()).childrenByParent.get(person.id) ?? [];
}

export async function getParents(
  person: Person
): Promise<{ father?: Person; mother?: Person }> {
  const { byId } = await getFamilyData();
  return {
    father: person.father_id ? byId.get(person.father_id) : undefined,
    mother: person.mother_id ? byId.get(person.mother_id) : undefined,
  };
}

export async function getSiblings(person: Person): Promise<Person[]> {
  const { childrenByParent } = await getFamilyData();
  const parentId = person.father_id ?? person.mother_id;
  if (!parentId) return [];
  return (childrenByParent.get(parentId) ?? []).filter(
    (p) => p.id !== person.id
  );
}

export async function getAncestors(person: Person): Promise<Person[]> {
  const { byId } = await getFamilyData();
  const chain: Person[] = [];
  let current = person;
  const guard = new Set<string>();
  while (current.father_id ?? current.mother_id) {
    const parentId = current.father_id ?? current.mother_id!;
    if (guard.has(parentId)) break;
    guard.add(parentId);
    const parent = byId.get(parentId);
    if (!parent) break;
    chain.unshift(parent);
    current = parent;
  }
  return chain;
}

export async function getGeneration(person: Person): Promise<number> {
  return (await getAncestors(person)).length + 1;
}

// ---------------------------------------------------------------------------
// Generations
// ---------------------------------------------------------------------------

export interface Generation {
  generation: number;
  people: Person[];
}

export async function getGenerations(): Promise<Generation[]> {
  const { people, byId } = await getFamilyData();
  const depthOf = (person: Person): number => {
    let depth = 1;
    let current = person;
    const guard = new Set<string>();
    while (current.father_id ?? current.mother_id) {
      const parentId = current.father_id ?? current.mother_id!;
      if (guard.has(parentId)) break;
      guard.add(parentId);
      const parent = byId.get(parentId);
      if (!parent) break;
      depth += 1;
      current = parent;
    }
    return depth;
  };

  const map = new Map<number, Person[]>();
  for (const person of people) {
    const depth = depthOf(person);
    const list = map.get(depth) ?? [];
    list.push(person);
    map.set(depth, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([generation, list]) => ({ generation, people: list }));
}

// ---------------------------------------------------------------------------
// Houses (founding branches)
// ---------------------------------------------------------------------------

export interface House {
  label: string;
  slug: string;
  memberCount: number;
  head?: Person;
}

/** Slugify a house label into a stable anchor/filter id. */
export function houseSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getHouses(): Promise<House[]> {
  const { people } = await getFamilyData();
  const map = new Map<string, House>();
  for (const person of people) {
    if (!person.house) continue;
    const slug = houseSlug(person.house);
    const entry = map.get(slug) ?? {
      label: person.house,
      slug,
      memberCount: 0,
      head: undefined,
    };
    entry.memberCount += 1;
    // The head is the earliest (lowest sort_order) person of the house.
    if (
      !entry.head ||
      (person.sort_order ?? Infinity) < (entry.head.sort_order ?? Infinity)
    ) {
      entry.head = person;
    }
    map.set(slug, entry);
  }
  return [...map.values()].sort(
    (a, b) => (a.head?.sort_order ?? 0) - (b.head?.sort_order ?? 0)
  );
}

// ---------------------------------------------------------------------------
// Connected families (houses joined by marriage) — parsed from spouse text
// ---------------------------------------------------------------------------

export interface ConnectedFamily {
  name: string;
  type: "house" | "family";
  connections: { slug: string; name: string; detail: string }[];
}

export async function getConnectedFamilies(): Promise<ConnectedFamily[]> {
  const { people } = await getFamilyData();
  const map = new Map<string, ConnectedFamily>();
  const add = (name: string, type: "house" | "family", person: Person) => {
    const key = `${type}:${name}`;
    const entry = map.get(key) ?? { name, type, connections: [] };
    entry.connections.push({
      slug: person.slug,
      name: person.full_name,
      detail: person.spouse ?? "",
    });
    map.set(key, entry);
  };
  for (const person of people) {
    if (!person.spouse) continue;
    for (const m of person.spouse.matchAll(/of the (.+?) house/gi))
      add(m[1].trim(), "house", person);
    for (const m of person.spouse.matchAll(/into the (.+?) family/gi))
      add(m[1].trim(), "family", person);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Family chart (household-focused, reading-friendly) + map tree
// ---------------------------------------------------------------------------

export interface FamilyChart {
  focus: Person;
  spouse?: Person;
  father?: Person;
  mother?: Person;
  paternalGrandfather?: Person;
  paternalGrandmother?: Person;
  maternalGrandfather?: Person;
  maternalGrandmother?: Person;
  children: Person[];
  siblings: Person[];
}

export async function getSpouse(person: Person): Promise<Person | undefined> {
  const spouses = await getSpouses(person);
  return spouses[0];
}

/** All linked spouses (bidirectional) — covers dual-wife households. */
export async function getSpouses(person: Person): Promise<Person[]> {
  const { people, byId } = await getFamilyData();
  const seen = new Set<string>();
  const out: Person[] = [];

  if (person.spouse_id) {
    const linked = byId.get(person.spouse_id);
    if (linked) {
      out.push(linked);
      seen.add(linked.id);
    }
  }
  for (const other of people) {
    if (other.spouse_id === person.id && !seen.has(other.id)) {
      out.push(other);
      seen.add(other.id);
    }
  }
  return out;
}

/** One household at a time: grandparents → parents → focus → children. */
export async function getFamilyChart(
  slug?: string | null
): Promise<FamilyChart | null> {
  const { people, bySlug, byId, childrenByParent } = await getFamilyData();
  if (people.length === 0) return null;

  // Prefer bloodline roots (not in-married spouses) as the default focus.
  const roots = people
    .filter((p) => !p.father_id && !p.mother_id && !p.married_in)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const focus =
    (slug ? bySlug.get(slug) : undefined) ?? roots[0] ?? people[0];
  if (!focus) return null;

  const father = focus.father_id ? byId.get(focus.father_id) : undefined;
  const mother = focus.mother_id ? byId.get(focus.mother_id) : undefined;
  const spouse = focus.spouse_id ? byId.get(focus.spouse_id) : undefined;

  // Children of this household: by father or mother id.
  const asParent =
    childrenByParent.get(focus.id) ??
    (spouse ? childrenByParent.get(spouse.id) : undefined) ??
    [];

  return {
    focus,
    spouse,
    father,
    mother,
    paternalGrandfather: father?.father_id
      ? byId.get(father.father_id)
      : undefined,
    paternalGrandmother: father?.mother_id
      ? byId.get(father.mother_id)
      : undefined,
    maternalGrandfather: mother?.father_id
      ? byId.get(mother.father_id)
      : undefined,
    maternalGrandmother: mother?.mother_id
      ? byId.get(mother.mother_id)
      : undefined,
    children: asParent,
    siblings: father
      ? (childrenByParent.get(father.id) ?? []).filter((p) => p.id !== focus.id)
      : mother
        ? (childrenByParent.get(mother.id) ?? []).filter(
            (p) => p.id !== focus.id
          )
        : [],
  };
}

export interface TreeNode {
  id: string;
  name: string;
  gender: Gender;
  spouse?: string;
  order?: string;
  note?: string;
  house?: string;
  children?: TreeNode[];
}

export async function getTree(): Promise<TreeNode | null> {
  const { people, childrenByParent } = await getFamilyData();
  // Map tree follows the bloodline — in-married spouses are shown on cards,
  // not as separate generation roots.
  const roots = people.filter(
    (p) => !p.father_id && !p.mother_id && !p.married_in
  );
  if (roots.length === 0) return null;

  const toNode = (person: Person): TreeNode => {
    const kids = childrenByParent.get(person.id) ?? [];
    const spousePerson = person.spouse_id
      ? people.find((p) => p.id === person.spouse_id)
      : undefined;
    return {
      id: person.slug,
      name: person.full_name,
      gender: person.gender,
      spouse: spousePerson?.full_name ?? person.spouse ?? undefined,
      order: person.honorific ?? undefined,
      note: person.bio ?? undefined,
      house: person.house ?? undefined,
      children: kids.length ? kids.map(toNode) : undefined,
    };
  };

  // Prefer the single genealogical root; if several exist, nest them under the
  // first (earliest) so the canvas still shows one connected tree.
  const [primary, ...others] = roots.sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const node = toNode(primary);
  if (others.length) {
    node.children = [...(node.children ?? []), ...others.map(toNode)];
  }
  return node;
}

export async function countPeople(): Promise<number> {
  return (await getFamilyData()).people.length;
}
