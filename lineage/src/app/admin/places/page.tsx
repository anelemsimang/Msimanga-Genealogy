import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Plus, Pencil } from "lucide-react";
import { getAllPlaces } from "@/lib/places/service";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Places",
  description: "Manage places and locations in the family archive.",
};

export default async function AdminPlacesPage() {
  let places: Awaited<ReturnType<typeof getAllPlaces>> = [];
  let loadError: string | null = null;
  try {
    places = await getAllPlaces();
  } catch (err) {
    loadError =
      err instanceof Error
        ? err.message
        : "Could not load places. Apply migration 0004_places.sql first.";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Places
          </h1>
          <p className="mt-1 text-muted-foreground">
            Add districts, villages, and areas as you gather history.{" "}
            {places.length} place{places.length === 1 ? "" : "s"} recorded.
          </p>
        </div>
        <Button
          render={<Link href="/admin/places/new" />}
          nativeButton={false}
          size="lg"
        >
          <Plus className="size-4" /> Add place
        </Button>
      </div>

      {loadError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
          <p className="mt-1 text-muted-foreground">
            Run{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              supabase/migrations/0004_places.sql
            </code>{" "}
            in the Supabase SQL Editor, then refresh.
          </p>
        </div>
      )}

      {!loadError && places.length === 0 && (
        <div className="rounded-2xl border border-dashed py-14 text-center">
          <MapPin className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-heading text-lg font-semibold">
            No places yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start with a district or village that appears in the family notes.
          </p>
        </div>
      )}

      {places.length > 0 && (
        <ul className="divide-y rounded-xl border bg-card">
          {places.map((place) => (
            <li
              key={place.id}
              className="flex items-center gap-3 px-4 py-3 sm:px-5"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{place.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {[place.region, place.description]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <Button
                render={<Link href={`/admin/places/${place.id}/edit`} />}
                nativeButton={false}
                variant="outline"
                size="sm"
              >
                <Pencil className="size-3.5" /> Edit
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
