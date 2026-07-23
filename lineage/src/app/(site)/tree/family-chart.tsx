import Link from "next/link";
import { ArrowUpRight, Users, Heart } from "lucide-react";
import type { FamilyChart, Person } from "@/lib/people/service";
import { PersonAvatar } from "@/components/person-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function vitalLine(person: Person): string | null {
  const parts: string[] = [];
  if (person.birth_date || person.birth_place) {
    parts.push(
      `b. ${[person.birth_date, person.birth_place].filter(Boolean).join(", ")}`
    );
  }
  if (person.death_date || person.death_place) {
    parts.push(
      `d. ${[person.death_date, person.death_place].filter(Boolean).join(", ")}`
    );
  }
  return parts.length ? parts.join(" · ") : null;
}

function ChartPersonCard({
  person,
  role,
  emphasis = "normal",
  showOpenFamily = true,
}: {
  person: Person;
  role?: string;
  emphasis?: "normal" | "focus";
  showOpenFamily?: boolean;
}) {
  const vitals = vitalLine(person);
  const isFocus = emphasis === "focus";

  return (
    <article
      className={cn(
        "flex w-full max-w-[17rem] flex-col rounded-xl border bg-card text-left shadow-sm",
        isFocus
          ? "border-primary/40 ring-2 ring-primary/20"
          : "border-border/70",
        person.gender === "male" && "border-l-4 border-l-chart-3",
        person.gender === "female" && "border-l-4 border-l-chart-4"
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        <PersonAvatar
          name={person.full_name}
          gender={person.gender}
          imageUrl={person.imageUrl}
          size="md"
        />
        <div className="min-w-0 flex-1">
          {role && (
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {role}
            </p>
          )}
          <Link
            href={`/people/${person.slug}`}
            className="font-heading text-base font-semibold leading-snug hover:text-primary"
          >
            {person.full_name}
          </Link>
          {person.honorific && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {person.honorific}
            </p>
          )}
          {vitals && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {vitals}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 border-t bg-muted/30 px-3 py-2">
        <Button
          render={<Link href={`/people/${person.slug}`} />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="min-h-9"
        >
          Profile
        </Button>
        {showOpenFamily && (
          <Button
            render={<Link href={`/tree?person=${person.slug}`} />}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="min-h-9"
          >
            <Users className="size-3.5" />
            Family chart
          </Button>
        )}
      </div>
    </article>
  );
}

function TextSpouseCard({
  spouse,
  marriageDate,
  marriagePlace,
}: {
  spouse: string;
  marriageDate: string | null;
  marriagePlace: string | null;
}) {
  const married = [marriageDate, marriagePlace].filter(Boolean).join(", ");
  return (
    <article className="flex w-full max-w-[17rem] flex-col rounded-xl border border-l-4 border-border/70 border-l-chart-4 bg-card text-left shadow-sm">
      <div className="flex items-start gap-3 p-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-chart-4/15 text-chart-4">
          <Heart className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Spouse
          </p>
          <p className="font-heading text-base font-semibold leading-snug">
            {spouse}
          </p>
          {married && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              m. {married}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function ConnectorDown() {
  return (
    <div aria-hidden className="flex justify-center py-1">
      <div className="h-6 w-px bg-border" />
    </div>
  );
}

function PairRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-3 sm:gap-4">
      {children}
    </div>
  );
}

/**
 * Reading-friendly household chart inspired by classic genealogy family charts
 * (e.g. TNG): grandparents → parents → focus (+ spouse) → children.
 */
export function FamilyChartView({ chart }: { chart: FamilyChart }) {
  const {
    focus,
    spouse,
    father,
    mother,
    paternalGrandfather,
    paternalGrandmother,
    maternalGrandfather,
    maternalGrandmother,
    children,
    siblings,
  } = chart;

  const hasPaternalGrands = paternalGrandfather || paternalGrandmother;
  const hasMaternalGrands = maternalGrandfather || maternalGrandmother;
  const hasGrands = hasPaternalGrands || hasMaternalGrands;
  const hasParents = father || mother || focus.father_name || focus.mother_name;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-1 px-2 py-6 sm:px-4">
      {/* Title */}
      <div className="mb-6 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Family of {focus.full_name}
        </h2>
        {(spouse || focus.spouse) && (
          <p className="mt-1 text-muted-foreground">
            with {spouse?.full_name ?? focus.spouse}
          </p>
        )}
        {focus.house && (
          <Badge variant="secondary" className="mt-2">
            {focus.house.replace(/^Branch \d+ — /, "")}
          </Badge>
        )}
      </div>

      {/* Grandparents */}
      {hasGrands && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              {hasPaternalGrands && (
                <>
                  <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Father&rsquo;s parents
                  </p>
                  <PairRow>
                    {paternalGrandfather && (
                      <ChartPersonCard
                        person={paternalGrandfather}
                        role="Grandfather"
                      />
                    )}
                    {paternalGrandmother && (
                      <ChartPersonCard
                        person={paternalGrandmother}
                        role="Grandmother"
                      />
                    )}
                  </PairRow>
                </>
              )}
            </div>
            <div className="space-y-2">
              {hasMaternalGrands && (
                <>
                  <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Mother&rsquo;s parents
                  </p>
                  <PairRow>
                    {maternalGrandfather && (
                      <ChartPersonCard
                        person={maternalGrandfather}
                        role="Grandfather"
                      />
                    )}
                    {maternalGrandmother && (
                      <ChartPersonCard
                        person={maternalGrandmother}
                        role="Grandmother"
                      />
                    )}
                  </PairRow>
                </>
              )}
            </div>
          </div>
          <ConnectorDown />
        </>
      )}

      {/* Parents */}
      {hasParents && (
        <>
          <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Parents
          </p>
          <PairRow>
            {father ? (
              <ChartPersonCard person={father} role="Father" />
            ) : focus.father_name ? (
              <TextOnlyCard label="Father" name={focus.father_name} />
            ) : null}
            {mother ? (
              <ChartPersonCard person={mother} role="Mother" />
            ) : focus.mother_name ? (
              <TextOnlyCard label="Mother" name={focus.mother_name} />
            ) : null}
          </PairRow>
          <ConnectorDown />
        </>
      )}

      {/* Focus + spouse */}
      <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
        This generation
      </p>
      <PairRow>
        <ChartPersonCard
          person={focus}
          role={focus.honorific ?? undefined}
          emphasis="focus"
          showOpenFamily={false}
        />
        {spouse ? (
          <ChartPersonCard person={spouse} role="Spouse" />
        ) : focus.spouse ? (
          <TextSpouseCard
            spouse={focus.spouse}
            marriageDate={focus.marriage_date}
            marriagePlace={focus.marriage_place}
          />
        ) : null}
      </PairRow>

      {focus.bio && (
        <div className="mx-auto mt-4 max-w-2xl rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
          {focus.bio}
        </div>
      )}

      {/* Children */}
      {children.length > 0 && (
        <>
          <ConnectorDown />
          <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Children ({children.length})
          </p>
          <div className="mt-2 grid justify-items-center gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <ChartPersonCard key={child.id} person={child} />
            ))}
          </div>
        </>
      )}

      {/* Siblings — helpful for navigating sideways */}
      {siblings.length > 0 && (
        <div className="mt-10 border-t pt-6">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Siblings of {focus.full_name.split(" ")[0]}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {siblings.map((sib) => (
              <Button
                key={sib.id}
                render={<Link href={`/tree?person=${sib.slug}`} />}
                nativeButton={false}
                variant="outline"
                size="sm"
              >
                {sib.full_name.replace(" Msimanga", "")}
                <ArrowUpRight className="size-3.5" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TextOnlyCard({ label, name }: { label: string; name: string }) {
  return (
    <article className="flex w-full max-w-[17rem] items-start gap-3 rounded-xl border border-dashed bg-muted/20 p-3.5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
        {label[0]}
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-heading font-semibold">{name}</p>
      </div>
    </article>
  );
}
