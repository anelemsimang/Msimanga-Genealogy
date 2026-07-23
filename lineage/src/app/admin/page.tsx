import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllPeople } from "@/lib/people/service";
import { Button } from "@/components/ui/button";
import { AdminPeopleSearch } from "@/components/admin/people-search";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage people in the Msimanga family archive.",
};

export default async function AdminDashboardPage() {
  const people = await getAllPeople();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            People
          </h1>
          <p className="mt-1 text-muted-foreground">
            Add, edit, and photograph family members. {people.length} people in
            the archive.
          </p>
        </div>
        <Button
          render={<Link href="/admin/people/new" />}
          nativeButton={false}
          size="lg"
        >
          <Plus className="size-4" /> Add person
        </Button>
      </div>

      <AdminPeopleSearch
        people={people.map((p) => ({
          id: p.id,
          slug: p.slug,
          full_name: p.full_name,
          gender: p.gender,
          honorific: p.honorific,
          house: p.house,
          birth_date: p.birth_date,
          death_date: p.death_date,
          imageUrl: p.imageUrl,
          hasBio: Boolean(p.bio),
        }))}
      />
    </div>
  );
}
