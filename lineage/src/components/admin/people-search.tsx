"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Search, ImageIcon, BookText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/person-avatar";
import type { Gender } from "@/lib/supabase/types";

export interface AdminPersonRow {
  id: string;
  slug: string;
  full_name: string;
  gender: Gender;
  honorific: string | null;
  house: string | null;
  birth_date: string | null;
  death_date: string | null;
  imageUrl: string | null;
  hasBio: boolean;
}

export function AdminPeopleSearch({ people }: { people: AdminPersonRow[] }) {
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((p) =>
      [p.full_name, p.honorific ?? "", p.house ?? "", p.slug]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [people, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 shadow-sm">
        <Search className="size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, house, or slug…"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          aria-label="Search people"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "person" : "people"}
      </p>

      <div className="overflow-hidden rounded-xl border bg-card">
        <ul className="divide-y divide-border">
          {filtered.map((person) => (
            <li
              key={person.id}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <PersonAvatar
                  name={person.full_name}
                  gender={person.gender}
                  imageUrl={person.imageUrl}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate font-heading font-medium">
                    {person.full_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[person.honorific, person.birth_date, person.death_date]
                      .filter(Boolean)
                      .join(" · ") || person.slug}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                {person.imageUrl ? (
                  <Badge variant="secondary" className="gap-1">
                    <ImageIcon className="size-3" /> Photo
                  </Badge>
                ) : null}
                {person.hasBio ? (
                  <Badge variant="outline" className="gap-1">
                    <BookText className="size-3" /> Bio
                  </Badge>
                ) : null}
                <Button
                  render={<Link href={`/people/${person.slug}`} />}
                  nativeButton={false}
                  variant="ghost"
                  size="sm"
                >
                  View
                </Button>
                <Button
                  render={<Link href={`/admin/people/${person.id}/edit`} />}
                  nativeButton={false}
                  size="sm"
                >
                  <Pencil className="size-3.5" /> Edit
                </Button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-12 text-center text-sm text-muted-foreground">
              No people match that search.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
