import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAllPeople } from "@/lib/people/service";
import { PersonForm } from "@/components/admin/person-form";

export const metadata: Metadata = {
  title: "Add person",
};

export default async function NewPersonPage() {
  const people = await getAllPeople();
  const options = people.map((p) => ({ id: p.id, full_name: p.full_name }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Back to people
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          Add a person
        </h1>
        <p className="mt-1 text-muted-foreground">
          Fill in what you know — you can add a photo after saving.
        </p>
      </div>
      <PersonForm peopleOptions={options} canDelete={false} />
    </div>
  );
}
