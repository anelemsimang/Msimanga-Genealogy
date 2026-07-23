import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { PlaceRow } from "@/lib/supabase/types";
import { getFamilyData } from "@/lib/people/service";

export type { PlaceRow } from "@/lib/supabase/types";

export interface Place extends PlaceRow {
  connections: { slug: string; name: string; detail: string }[];
}

export const getAllPlaces = cache(async (): Promise<PlaceRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PlaceRow[];
});

export async function getPlaceById(id: string): Promise<PlaceRow | undefined> {
  const places = await getAllPlaces();
  return places.find((p) => p.id === id);
}

export async function getPlaceBySlug(
  slug: string
): Promise<PlaceRow | undefined> {
  const places = await getAllPlaces();
  return places.find((p) => p.slug === slug);
}

/**
 * Places for the public /places page: DB rows plus people whose life-event
 * text, spouse notes, or bio mention the place name (or an alias).
 */
export async function getPlacesWithConnections(): Promise<Place[]> {
  const [places, { people }] = await Promise.all([
    getAllPlaces(),
    getFamilyData(),
  ]);

  return places.map((place) => {
    const needles = [place.name, ...(place.aliases ?? [])];
    const connections: Place["connections"] = [];
    for (const person of people) {
      const haystack = [
        person.spouse,
        person.bio,
        person.birth_place,
        person.death_place,
        person.burial_place,
        person.marriage_place,
      ]
        .filter(Boolean)
        .join(" ");
      if (
        needles.some((n) =>
          haystack.toLowerCase().includes(n.toLowerCase())
        )
      ) {
        connections.push({
          slug: person.slug,
          name: person.full_name,
          detail: person.spouse ?? person.bio ?? "",
        });
      }
    }
    return { ...place, connections };
  });
}
