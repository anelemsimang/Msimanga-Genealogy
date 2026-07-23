import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlacesWithConnections } from "@/lib/places/service";

export const metadata: Metadata = {
  title: "Places",
  description:
    "The districts, homes, and areas named in the Msimanga family archive.",
};

export default async function PlacesPage() {
  let allPlaces: Awaited<ReturnType<typeof getPlacesWithConnections>> = [];
  try {
    allPlaces = await getPlacesWithConnections();
  } catch {
    // Table may not exist until migration 0004 is applied.
    allPlaces = [];
  }
  const places = allPlaces.filter((p) => p.connections.length > 0);
  const orphanPlaces = allPlaces.filter((p) => p.connections.length === 0);

  return (
    <div className="flex flex-col">
      <PageHeader
        icon={MapPin}
        eyebrow="Where the family lived & married"
        title="Places in the record"
        description="The districts, homes, and areas of the Eastern Cape named as the family grew and joined with other houses."
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {allPlaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-16 text-center">
            <p className="font-heading text-lg font-semibold">No places yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Editors can add locations from the dashboard.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <Card key={place.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-1.5">
                        <MapPin className="size-4 shrink-0 text-primary" />
                        {place.name}
                      </CardTitle>
                      {place.region && (
                        <CardDescription className="mt-0.5">
                          {place.region}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 gap-1">
                      <Users className="size-3" />
                      {place.connections.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    {place.description}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    {place.connections.slice(0, 6).map((c) => (
                      <Badge
                        key={c.slug}
                        variant="outline"
                        render={<Link href={`/people/${c.slug}`} />}
                      >
                        {c.name.replace(" Msimanga", "")}
                      </Badge>
                    ))}
                    {place.connections.length > 6 && (
                      <Badge variant="ghost">
                        +{place.connections.length - 6} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {orphanPlaces.length > 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            Also recorded (not yet linked to a person&rsquo;s notes):{" "}
            {orphanPlaces.map((p) => p.name).join(", ")}.
          </p>
        )}
      </div>
    </div>
  );
}
