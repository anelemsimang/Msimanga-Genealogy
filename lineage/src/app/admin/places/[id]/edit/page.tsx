import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPlaceById } from "@/lib/places/service";
import { isAdmin } from "@/lib/auth/session";
import { PlaceForm } from "@/components/admin/place-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const place = await getPlaceById(id);
    return { title: place ? `Edit ${place.name}` : "Edit place" };
  } catch {
    return { title: "Edit place" };
  }
}

export default async function EditPlacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  let place;
  try {
    place = await getPlaceById(id);
  } catch {
    notFound();
  }
  if (!place) notFound();
  const canDelete = await isAdmin();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/places"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Back to places
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          Edit {place.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Update the name, region, description, or aliases used to match people.
        </p>
        {saved === "1" && (
          <p className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
            Place created. You can refine the description below.
          </p>
        )}
      </div>
      <PlaceForm place={place} canDelete={canDelete} />
    </div>
  );
}