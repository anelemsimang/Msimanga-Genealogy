import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getAllPeople, getPersonById, getChildren } from "@/lib/people/service";
import { isAdmin } from "@/lib/auth/session";
import { PersonForm } from "@/components/admin/person-form";
import { AddGenerationAbove } from "@/components/admin/add-generation-above";
import { AddSpouseProfile } from "@/components/admin/add-spouse-profile";
import { ChildrenBirthOrder } from "@/components/admin/children-birth-order";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = await getPersonById(id);
  return { title: person ? `Edit ${person.full_name}` : "Edit person" };
}

export default async function EditPersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [person, people, canDelete] = await Promise.all([
    getPersonById(id),
    getAllPeople(),
    isAdmin(),
  ]);
  if (!person) notFound();

  const children = await getChildren(person);

  const options = people
    .filter((p) => p.id !== person.id)
    .map((p) => ({ id: p.id, full_name: p.full_name }));

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
          Edit {person.full_name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Update life events, parents, biography, and photograph.
        </p>
        {saved === "1" && (
          <p className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
            Person created. You can now upload a photograph below.
          </p>
        )}
      </div>
      <AddGenerationAbove
        personId={person.id}
        personName={person.full_name}
        hasFather={Boolean(person.father_id)}
        hasMother={Boolean(person.mother_id)}
      />
      <AddSpouseProfile
        personId={person.id}
        personName={person.full_name}
        hasLinkedSpouse={Boolean(person.spouse_id)}
        defaultName={person.spouse}
        defaultGender={person.gender === "female" ? "male" : "female"}
      />
      <ChildrenBirthOrder
        parentId={person.id}
        parentName={person.full_name}
        children={children.map((c) => ({
          id: c.id,
          slug: c.slug,
          full_name: c.full_name,
          gender: c.gender,
          honorific: c.honorific,
          imageUrl: c.imageUrl,
          sort_order: c.sort_order,
        }))}
      />

      <PersonForm
        person={person}
        peopleOptions={options}
        canDelete={canDelete}
      />
    </div>
  );
}
