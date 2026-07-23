import type { Metadata } from "next";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  getAllPeople,
  getHouses,
  getGenerations,
  houseSlug,
  countPeople,
} from "@/lib/people/service";
import {
  PeopleDirectory,
  type DirectoryPerson,
  type DirectoryHouse,
} from "./people-directory";

export const metadata: Metadata = {
  title: "People",
  description:
    "Search and browse everyone recorded in the Msimanga family archive.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [people, houses, generations, total] = await Promise.all([
    getAllPeople(),
    getHouses(),
    getGenerations(),
    countPeople(),
  ]);

  // slug -> generation lookup
  const generationBySlug = new Map<string, number>();
  for (const gen of generations)
    for (const person of gen.people)
      generationBySlug.set(person.slug, gen.generation);

  const directoryPeople: DirectoryPerson[] = people.map((p) => ({
    slug: p.slug,
    name: p.full_name,
    gender: p.gender,
    honorific: p.honorific,
    spouse: p.spouse,
    bio: p.bio,
    houseSlug: p.house ? houseSlug(p.house) : null,
    houseLabel: p.house,
    generation: generationBySlug.get(p.slug) ?? 1,
    imageUrl: p.imageUrl,
  }));

  const directoryHouses: DirectoryHouse[] = houses.map((h) => ({
    slug: h.slug,
    label: h.label,
    shortName: h.head?.full_name.split(" ")[0] ?? h.label,
    count: h.memberCount,
  }));

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={Users}
        eyebrow="The family directory"
        title="People of the Msimanga family"
        description={`Search across all ${total} people recorded in the archive — filter by house or gender, and open anyone to see how they connect.`}
      />
      <PeopleDirectory
        people={directoryPeople}
        houses={directoryHouses}
        initialQuery={q ?? ""}
      />
    </div>
  );
}
