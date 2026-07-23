import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GitBranch,
  BookText,
  Heart,
  ChevronRight,
  Users,
  Pencil,
} from "lucide-react";
import {
  getPersonBySlug,
  getParents,
  getChildren,
  getSiblings,
  getAncestors,
  getSpouses,
  houseSlug,
  type Person,
} from "@/lib/people/service";
import { isEditor } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PersonAvatar } from "@/components/person-avatar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = await getPersonBySlug(id);
  if (!person) return { title: "Person not found" };
  return {
    title: person.full_name,
    description:
      person.bio ?? `${person.full_name} in the Msimanga family archive.`,
  };
}

function RelationLink({ person }: { person: Person }) {
  return (
    <Link
      href={`/people/${person.slug}`}
      className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <PersonAvatar
        name={person.full_name}
        gender={person.gender}
        imageUrl={person.imageUrl}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight group-hover:text-primary">
          {person.full_name}
        </p>
        {person.honorific && (
          <p className="truncate text-xs text-muted-foreground">
            {person.honorific}
          </p>
        )}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
        <Icon className="size-5 text-primary" />
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

interface VitalEvent {
  label: string;
  date: string | null;
  place: string | null;
}

function VitalEvents({ events }: { events: VitalEvent[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[18rem] text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">Event</th>
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Place</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events.map((event) => (
            <tr key={event.label} className="align-top">
              <th className="w-24 bg-muted/20 px-3 py-2.5 text-left font-medium sm:w-32">
                {event.label}
              </th>
              <td className="px-3 py-2.5 whitespace-nowrap">
                {event.date || "n/a"}
              </td>
              <td className="px-3 py-2.5 break-words text-muted-foreground">
                {event.place || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPersonBySlug(id);
  if (!person) notFound();

  const [{ father, mother }, children, siblings, ancestors, spouses, canEdit] =
    await Promise.all([
      getParents(person),
      getChildren(person),
      getSiblings(person),
      getAncestors(person),
      getSpouses(person),
      isEditor(),
    ]);

  const generation = ancestors.length + 1;

  const vitals: VitalEvent[] = [
    { label: "Birth", date: person.birth_date, place: person.birth_place },
    { label: "Death", date: person.death_date, place: person.death_place },
    { label: "Burial", date: person.burial_date, place: person.burial_place },
    {
      label: "Marriage",
      date: person.marriage_date,
      place: person.marriage_place,
    },
  ];
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      {/* Ancestor breadcrumb — scroll on narrow screens instead of wrapping tall */}
      <nav className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1 text-sm text-muted-foreground">
        <Link href="/search" className="shrink-0 hover:text-foreground">
          People
        </Link>
        {ancestors.length > 2 && (
          <>
            <ChevronRight className="size-3.5 shrink-0" />
            <span className="shrink-0">…</span>
          </>
        )}
        {ancestors.slice(-2).map((ancestor) => (
          <span key={ancestor.id} className="flex shrink-0 items-center gap-1">
            <ChevronRight className="size-3.5" />
            <Link
              href={`/people/${ancestor.slug}`}
              className="hover:text-foreground"
            >
              {ancestor.full_name.replace(" Msimanga", "")}
            </Link>
          </span>
        ))}
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="shrink-0 text-foreground">
          {person.full_name.replace(" Msimanga", "")}
        </span>
      </nav>

      {/* Person card: photo + vitals + parents */}
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-6">
          <div className="mx-auto shrink-0 sm:mx-0">
            <PersonAvatar
              name={person.full_name}
              gender={person.gender}
              imageUrl={person.imageUrl}
              size="card"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance break-words sm:text-3xl">
                  {person.full_name}
                </h1>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="capitalize">
                    {person.gender}
                  </Badge>
                  {!person.married_in && (
                    <Badge variant="outline">Generation {generation}</Badge>
                  )}
                  {person.married_in && (
                    <Badge variant="secondary">Married into the family</Badge>
                  )}
                  {person.honorific && (
                    <Badge variant="outline">{person.honorific}</Badge>
                  )}
                  {person.house && (
                    <Badge
                      variant="outline"
                      render={
                        <Link href={`/surnames#${houseSlug(person.house)}`} />
                      }
                    >
                      {person.house.replace(/^Branch \d+ — /, "")}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
                {canEdit && (
                  <Button
                    render={
                      <Link href={`/admin/people/${person.id}/edit`} />
                    }
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                  >
                    <Pencil className="size-4" /> Edit
                  </Button>
                )}
                <Button
                  render={
                    <Link href={`/tree?person=${person.slug}`} />
                  }
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                >
                  <GitBranch className="size-4" /> Tree
                </Button>
              </div>
            </div>

            <div className="mt-5">
              <VitalEvents events={vitals} />
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[16rem] text-sm">
                <tbody className="divide-y divide-border">
                  <tr>
                    <th className="w-24 bg-muted/20 px-3 py-2.5 text-left font-medium sm:w-32">
                      Father
                    </th>
                    <td className="px-3 py-2.5 break-words">
                      {father ? (
                        <Link
                          href={`/people/${father.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {father.full_name}
                        </Link>
                      ) : (
                        person.father_name || "n/a"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th className="w-24 bg-muted/20 px-3 py-2.5 text-left font-medium sm:w-32">
                      Mother
                    </th>
                    <td className="px-3 py-2.5 break-words">
                      {mother ? (
                        <Link
                          href={`/people/${mother.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {mother.full_name}
                        </Link>
                      ) : (
                        person.mother_name || "n/a"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-7" />

      <div className="flex flex-col gap-8">
        {(father || mother) && (
          <Section title="Parents" icon={Users}>
            <div className="grid gap-2 sm:grid-cols-2">
              {father ? <RelationLink person={father} /> : null}
              {mother ? <RelationLink person={mother} /> : null}
            </div>
          </Section>
        )}

        {(spouses.length > 0 || person.spouse) && (
          <Section title="Marriage" icon={Heart}>
            {spouses.length > 0 ? (
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {spouses.map((s) => (
                    <RelationLink key={s.id} person={s} />
                  ))}
                </div>
                {person.spouse &&
                  spouses.length > 1 &&
                  !spouses.some((s) => s.full_name === person.spouse) && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {person.spouse}
                    </p>
                  )}
              </div>
            ) : (
              <p className="leading-relaxed">{person.spouse}</p>
            )}
          </Section>
        )}

        {person.bio && (
          <Section title="About" icon={BookText}>
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="leading-relaxed whitespace-pre-wrap text-foreground/90">
                {person.bio}
              </p>
            </div>
          </Section>
        )}

        {children.length > 0 && (
          <Section title={`Children (${children.length})`} icon={Users}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => (
                <RelationLink key={child.id} person={child} />
              ))}
            </div>
          </Section>
        )}

        {siblings.length > 0 && (
          <Section title={`Siblings (${siblings.length})`} icon={Users}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((sibling) => (
                <RelationLink key={sibling.id} person={sibling} />
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

