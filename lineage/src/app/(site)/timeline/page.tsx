import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Users, Star } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { getGenerations, getPersonBySlug, countPeople } from "@/lib/people/service";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "The Msimanga family across the generations, from Hlomza to today.",
};

const ordinals = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
];

export default async function TimelinePage() {
  const [generations, total, bhabhini, nqeyi] = await Promise.all([
    getGenerations(),
    countPeople(),
    getPersonBySlug("bhabhini"),
    getPersonBySlug("nqeyi"),
  ]);

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={CalendarClock}
        eyebrow="Across the generations"
        title="Family timeline"
        description={`The record traces ${generations.length} generations and ${total} people, from Hlomza — our root ancestor — down to the youngest recorded descendants.`}
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        {/* Notable dated event */}
        {(bhabhini || nqeyi) && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <Star className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-heading font-semibold">2002 — Twins born</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {bhabhini && (
                  <Link
                    href="/people/bhabhini"
                    className="font-medium text-foreground hover:text-primary"
                  >
                    Bhabhini
                  </Link>
                )}
                {bhabhini && nqeyi && " and "}
                {nqeyi && (
                  <Link
                    href="/people/nqeyi"
                    className="font-medium text-foreground hover:text-primary"
                  >
                    Nqeyi
                  </Link>
                )}
                , the last-born twins of Luke&rsquo;s house — the only birth year
                named in the original record.
              </p>
            </div>
          </div>
        )}

        {/* Generational timeline */}
        <ol className="relative border-l border-border pl-6">
          {generations.map(({ generation, people }) => (
            <li key={generation} className="mb-8 last:mb-0">
              <span className="absolute -left-[9px] flex size-4 items-center justify-center rounded-full border-2 border-background bg-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-lg font-semibold">
                  {ordinals[generation - 1] ?? `Generation ${generation}`}{" "}
                  generation
                </h2>
                <Badge variant="secondary" className="gap-1">
                  <Users className="size-3" />
                  {people.length}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {people.slice(0, 14).map((person) => (
                  <Badge
                    key={person.id}
                    variant="outline"
                    render={<Link href={`/people/${person.slug}`} />}
                  >
                    {person.full_name.replace(" Msimanga", "")}
                  </Badge>
                ))}
                {people.length > 14 && (
                  <Badge variant="ghost">+{people.length - 14} more</Badge>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
