"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { Gender } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/person-avatar";
import { cn } from "@/lib/utils";

export interface DirectoryPerson {
  slug: string;
  name: string;
  gender: Gender;
  honorific: string | null;
  spouse: string | null;
  bio: string | null;
  houseSlug: string | null;
  houseLabel: string | null;
  generation: number;
  imageUrl: string | null;
}

export interface DirectoryHouse {
  slug: string;
  label: string;
  shortName: string;
  count: number;
}

function matches(person: DirectoryPerson, q: string): boolean {
  if (!q) return true;
  return [
    person.name,
    person.honorific ?? "",
    person.spouse ?? "",
    person.bio ?? "",
    person.houseLabel ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

function PersonRow({ person }: { person: DirectoryPerson }) {
  return (
    <Link
      href={`/people/${person.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <PersonAvatar
        name={person.name}
        gender={person.gender}
        imageUrl={person.imageUrl}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading font-medium leading-tight group-hover:text-primary">
          {person.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {person.honorific
            ? person.honorific
            : person.spouse
              ? `⚭ ${person.spouse}`
              : (person.houseLabel ?? `Generation ${person.generation}`)}
        </p>
      </div>
      <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
        Gen {person.generation}
      </Badge>
    </Link>
  );
}

export function PeopleDirectory({
  people,
  houses,
  initialQuery,
}: {
  people: DirectoryPerson[];
  houses: DirectoryHouse[];
  initialQuery: string;
}) {
  const [query, setQuery] = React.useState(initialQuery);
  const [house, setHouse] = React.useState<string>("all");
  const [gender, setGender] = React.useState<"all" | Gender>("all");

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter(
      (p) =>
        matches(p, q) &&
        (house === "all" || p.houseSlug === house) &&
        (gender === "all" || p.gender === gender)
    );
  }, [people, query, house, gender]);

  const hasFilters = house !== "all" || gender !== "all" || query.trim() !== "";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Search box */}
      <div className="flex w-full min-w-0 items-center gap-2 rounded-full border bg-card p-1.5 shadow-sm">
        <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, house, spouse, or note…"
          aria-label="Search family members"
          className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-1 rounded-full"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-3">
        {houses.length > 0 && (
          <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
            <span className="mr-1 flex shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <SlidersHorizontal className="size-3.5" /> House
            </span>
            <FilterChip active={house === "all"} onClick={() => setHouse("all")}>
              All
            </FilterChip>
            {houses.map((h) => (
              <FilterChip
                key={h.slug}
                active={house === h.slug}
                onClick={() => setHouse(h.slug)}
              >
                {h.shortName}{" "}
                <span className="text-muted-foreground">({h.count})</span>
              </FilterChip>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Gender
          </span>
          {(["all", "male", "female"] as const).map((g) => (
            <FilterChip
              key={g}
              active={gender === g}
              onClick={() => setGender(g)}
            >
              <span className="capitalize">{g}</span>
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Results header */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "person" : "people"}
          {hasFilters && " match your filters"}
        </p>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setHouse("all");
              setGender("all");
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((person) => (
            <PersonRow key={person.slug} person={person} />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No one matches your search.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery("");
              setHouse("all");
              setGender("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-9 shrink-0 rounded-full border px-3 py-2 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </button>
  );
}
