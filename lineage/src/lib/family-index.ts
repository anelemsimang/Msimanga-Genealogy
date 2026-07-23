/**
 * Derived views over the static Msimanga family record (`family-tree.ts`).
 *
 * The source data is a nested tree. Most pages, however, need flat or grouped
 * views — a searchable directory, per-person relationships, generations, the
 * founding branches, the houses joined by marriage, and the places named in the
 * record. This module computes all of those once, at module load, from the
 * single source tree so every page stays consistent.
 */
import {
  familyTree,
  type FamilyMember,
  type Gender,
} from "./family-tree";

export interface IndexedPerson {
  id: string;
  name: string;
  gender: Gender;
  order?: string;
  spouse?: string;
  note?: string;
  /** Branch label if this person is themselves a branch head. */
  house?: string;
  /** 1-based generation number (Hlomza = generation 1). */
  generation: number;
  parentId?: string;
  parentName?: string;
  childIds: string[];
  /** Id of the founding-branch ancestor this person descends through. */
  branchId?: string;
  branchLabel?: string;
  /** Ancestor ids from the root down to (and including) the parent. */
  ancestorIds: string[];
  /** Total descendants beneath this person. */
  descendantCount: number;
}

const byId = new Map<string, IndexedPerson>();
const dfsOrder: string[] = [];

function countDescendants(member: FamilyMember): number {
  return (member.children ?? []).reduce(
    (sum, child) => sum + 1 + countDescendants(child),
    0
  );
}

function build(
  member: FamilyMember,
  parent: FamilyMember | undefined,
  ancestorIds: string[],
  generation: number,
  branchId: string | undefined,
  branchLabel: string | undefined
): void {
  const isBranchHead = Boolean(member.house);
  const resolvedBranchId = isBranchHead ? member.id : branchId;
  const resolvedBranchLabel = isBranchHead ? member.house : branchLabel;

  byId.set(member.id, {
    id: member.id,
    name: member.name,
    gender: member.gender,
    order: member.order,
    spouse: member.spouse,
    note: member.note,
    house: member.house,
    generation,
    parentId: parent?.id,
    parentName: parent?.name,
    childIds: (member.children ?? []).map((c) => c.id),
    branchId: resolvedBranchId,
    branchLabel: resolvedBranchLabel,
    ancestorIds,
    descendantCount: countDescendants(member),
  });
  dfsOrder.push(member.id);

  for (const child of member.children ?? []) {
    build(
      child,
      member,
      [...ancestorIds, member.id],
      generation + 1,
      resolvedBranchId,
      resolvedBranchLabel
    );
  }
}

build(familyTree, undefined, [], 1, undefined, undefined);

// ---------------------------------------------------------------------------
// Basic lookups
// ---------------------------------------------------------------------------

export function getPerson(id: string): IndexedPerson | undefined {
  return byId.get(id);
}

/** Every person, in the record's natural (depth-first) reading order. */
export function getAllPeople(): IndexedPerson[] {
  return dfsOrder.map((id) => byId.get(id)!);
}

export function getChildren(id: string): IndexedPerson[] {
  return (byId.get(id)?.childIds ?? []).map((cid) => byId.get(cid)!);
}

export function getParent(id: string): IndexedPerson | undefined {
  const parentId = byId.get(id)?.parentId;
  return parentId ? byId.get(parentId) : undefined;
}

export function getSiblings(id: string): IndexedPerson[] {
  const person = byId.get(id);
  if (!person?.parentId) return [];
  return getChildren(person.parentId).filter((p) => p.id !== id);
}

/** Ancestors from the root down to the person's parent. */
export function getAncestors(id: string): IndexedPerson[] {
  return (byId.get(id)?.ancestorIds ?? []).map((aid) => byId.get(aid)!);
}

export const TOTAL_PEOPLE = byId.size;

export function countByGender(): Record<Gender, number> {
  const counts: Record<Gender, number> = { male: 0, female: 0, unknown: 0 };
  for (const person of byId.values()) counts[person.gender] += 1;
  return counts;
}

// ---------------------------------------------------------------------------
// Generations
// ---------------------------------------------------------------------------

export interface Generation {
  generation: number;
  people: IndexedPerson[];
}

export function getGenerations(): Generation[] {
  const map = new Map<number, IndexedPerson[]>();
  for (const id of dfsOrder) {
    const person = byId.get(id)!;
    const list = map.get(person.generation) ?? [];
    list.push(person);
    map.set(person.generation, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([generation, people]) => ({ generation, people }));
}

// ---------------------------------------------------------------------------
// Founding branches (the five houses of Mthwalo)
// ---------------------------------------------------------------------------

export interface Branch {
  id: string;
  label: string;
  head: IndexedPerson;
  /** Everyone descending through this branch, including the head. */
  memberCount: number;
}

const BRANCH_ORDER = [
  "masole",
  "ndlebe",
  "gaxa-james",
  "mayifuthi",
  "matshakeni",
];

export function getBranches(): Branch[] {
  return BRANCH_ORDER.map((id) => {
    const head = byId.get(id)!;
    const memberCount = [...byId.values()].filter(
      (p) => p.branchId === id
    ).length;
    return { id, label: head.house ?? head.name, head, memberCount };
  });
}

export function getBranch(id: string): Branch | undefined {
  return getBranches().find((b) => b.id === id);
}

// ---------------------------------------------------------------------------
// Houses / families joined by marriage
// ---------------------------------------------------------------------------

export interface ConnectedFamily {
  name: string;
  type: "house" | "family";
  connections: { personId: string; personName: string; detail: string }[];
}

export function getConnectedFamilies(): ConnectedFamily[] {
  const map = new Map<string, ConnectedFamily>();

  const add = (
    name: string,
    type: "house" | "family",
    person: IndexedPerson
  ) => {
    const key = `${type}:${name}`;
    const entry = map.get(key) ?? { name, type, connections: [] };
    entry.connections.push({
      personId: person.id,
      personName: person.name,
      detail: person.spouse ?? "",
    });
    map.set(key, entry);
  };

  for (const person of byId.values()) {
    if (!person.spouse) continue;
    for (const match of person.spouse.matchAll(/of the (.+?) house/gi)) {
      add(match[1].trim(), "house", person);
    }
    for (const match of person.spouse.matchAll(/into the (.+?) family/gi)) {
      add(match[1].trim(), "family", person);
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Places named in the record
// ---------------------------------------------------------------------------

export interface Place {
  name: string;
  region?: string;
  description: string;
  /** Alternate spellings to match in the record text. */
  aliases?: string[];
  connections: { personId: string; personName: string; detail: string }[];
}

const PLACE_SEED: Omit<Place, "connections">[] = [
  {
    name: "Mount Fletcher",
    region: "Eastern Cape",
    description:
      "The district from which the family record was compiled and circulated.",
  },
  {
    name: "Mangolong",
    region: "Mount Fletcher",
    description:
      "Home of J.M. Mtatyana, who compiled the record, and of the Mtshizana family joined by marriage.",
  },
  {
    name: "Matatiele",
    region: "Eastern Cape",
    description:
      "District tied to the Fiva and Mazulu (Ludidi) houses that married into the family.",
  },
  {
    name: "Ludidi",
    region: "Matatiele",
    description:
      "Home of the Mazulu house — the people of Nomagusha (Makhesa), Matshakeni's wife.",
  },
  {
    name: "Mount Frere",
    region: "Eastern Cape",
    description: "District tied to the Nyakambi house at Luyengwe.",
  },
  {
    name: "Luyengwe",
    region: "Mount Frere",
    description: "Home of the Nyakambi house of Maxaba, who married Mthusulwana.",
  },
  {
    name: "Bubesi",
    description:
      "Home of the Nduku house of Mambhele, who married Zithulele.",
    aliases: ["Bhubesi"],
  },
  {
    name: "Kok's Hill",
    region: "Mzimkhulu",
    description: "Home of the Mjoli family, into which Msuthwazana married.",
  },
  {
    name: "Mzimkhulu",
    region: "KwaZulu-Natal border",
    description: "District of Kok's Hill and the Mjoli family.",
  },
  {
    name: "Tsolo",
    region: "Eastern Cape",
    description:
      "District of the Majokweni house (Sidwadweni), the people of Justice's wife.",
  },
  {
    name: "Sidwadweni",
    region: "Tsolo",
    description: "Area of the Majokweni house.",
  },
  {
    name: "Luphindo",
    description: "Home of the Matyakalana house, the people of Diniso's wife.",
  },
];

export function getPlaces(): Place[] {
  const people = [...byId.values()];
  return PLACE_SEED.map((seed) => {
    const needles = [seed.name, ...(seed.aliases ?? [])];
    const connections: Place["connections"] = [];
    for (const person of people) {
      const haystack = `${person.spouse ?? ""} ${person.note ?? ""}`;
      if (needles.some((n) => haystack.toLowerCase().includes(n.toLowerCase()))) {
        connections.push({
          personId: person.id,
          personName: person.name,
          detail: person.spouse ?? person.note ?? "",
        });
      }
    }
    return { ...seed, connections };
  });
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export function searchPeople(query: string): IndexedPerson[] {
  const q = query.trim().toLowerCase();
  const all = getAllPeople();
  if (!q) return all;
  return all.filter((person) => {
    const haystack = [
      person.name,
      person.order ?? "",
      person.spouse ?? "",
      person.note ?? "",
      person.branchLabel ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

/** Two-letter initials for avatars, stripping the shared surname. */
export function personInitials(name: string): string {
  const parts = name
    .replace(/msimanga/i, "")
    .replace(/["“”()]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
