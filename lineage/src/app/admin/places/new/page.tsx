import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PlaceForm } from "@/components/admin/place-form";

export const metadata: Metadata = {
  title: "Add place",
};

export default function NewPlacePage() {
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
          Add a place
        </h1>
        <p className="mt-1 text-muted-foreground">
          Record a district, village, or area that appears in the family
          history.
        </p>
      </div>
      <PlaceForm />
    </div>
  );
}
