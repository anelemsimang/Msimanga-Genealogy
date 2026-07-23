"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isEditor, isAdmin, getCurrentUser } from "@/lib/auth/session";
import {
  nullIfEmpty,
  personFormSchema,
  slugifyName,
} from "@/lib/people/schema";
import { parseAliases, placeFormSchema } from "@/lib/places/schema";
import type {
  PersonInsert,
  PersonUpdate,
  PersonRow,
  PlaceInsert,
  PlaceRow,
} from "@/lib/supabase/types";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

/** Sign the current user out and return to the home page. */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

function formDataToObject(formData: FormData) {
  return {
    full_name: String(formData.get("full_name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    gender: String(formData.get("gender") ?? "unknown"),
    honorific: String(formData.get("honorific") ?? ""),
    house: String(formData.get("house") ?? ""),
    father_id: String(formData.get("father_id") ?? ""),
    mother_id: String(formData.get("mother_id") ?? ""),
    father_name: String(formData.get("father_name") ?? ""),
    mother_name: String(formData.get("mother_name") ?? ""),
    spouse: String(formData.get("spouse") ?? ""),
    spouse_id: String(formData.get("spouse_id") ?? ""),
    married_in:
      formData.get("married_in") === "on" ||
      formData.get("married_in") === "true",
    birth_date: String(formData.get("birth_date") ?? ""),
    birth_place: String(formData.get("birth_place") ?? ""),
    death_date: String(formData.get("death_date") ?? ""),
    death_place: String(formData.get("death_place") ?? ""),
    burial_date: String(formData.get("burial_date") ?? ""),
    burial_place: String(formData.get("burial_place") ?? ""),
    marriage_date: String(formData.get("marriage_date") ?? ""),
    marriage_place: String(formData.get("marriage_place") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    is_living: formData.get("is_living") === "on" || formData.get("is_living") === "true",
    sort_order: formData.get("sort_order")
      ? Number(formData.get("sort_order"))
      : null,
  };
}

function toDbPayload(
  values: ReturnType<typeof formDataToObject>,
  userId: string | undefined,
  mode: "create" | "update"
): PersonInsert | PersonUpdate {
  const base = {
    full_name: values.full_name.trim(),
    slug: values.slug.trim() || slugifyName(values.full_name),
    gender: values.gender as "male" | "female" | "unknown",
    honorific: nullIfEmpty(values.honorific),
    house: nullIfEmpty(values.house),
    father_id: nullIfEmpty(values.father_id),
    mother_id: nullIfEmpty(values.mother_id),
    father_name: nullIfEmpty(values.father_name),
    mother_name: nullIfEmpty(values.mother_name),
    spouse: nullIfEmpty(values.spouse),
    spouse_id: nullIfEmpty(values.spouse_id),
    married_in: Boolean(values.married_in),
    birth_date: nullIfEmpty(values.birth_date),
    birth_place: nullIfEmpty(values.birth_place),
    death_date: nullIfEmpty(values.death_date),
    death_place: nullIfEmpty(values.death_place),
    burial_date: nullIfEmpty(values.burial_date),
    burial_place: nullIfEmpty(values.burial_place),
    marriage_date: nullIfEmpty(values.marriage_date),
    marriage_place: nullIfEmpty(values.marriage_place),
    bio: nullIfEmpty(values.bio),
    is_living: Boolean(values.is_living),
    sort_order: values.sort_order ?? null,
    updated_by: userId ?? null,
  };

  if (mode === "create") {
    return { ...base, created_by: userId ?? null };
  }
  return base;
}

export async function createPersonAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { ok: false, error: "You do not have permission to add people." };
  }

  const raw = formDataToObject(formData);
  const parsed = personFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  const payload = toDbPayload(raw, user?.id, "create") as PersonInsert;

  const { data, error } = await supabase
    .from("people")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That slug is already in use. Choose another." };
    }
    return { ok: false, error: error.message };
  }

  const created = data as Pick<PersonRow, "id" | "slug">;
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/tree");
  revalidatePath("/admin");
  revalidatePath(`/people/${created.slug}`);
  redirect(`/admin/people/${created.id}/edit?saved=1`);
}

export async function updatePersonAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { ok: false, error: "You do not have permission to edit people." };
  }

  const raw = formDataToObject(formData);
  const parsed = personFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  const payload = toDbPayload(raw, user?.id, "update");

  const { data, error } = await supabase
    .from("people")
    .update(payload)
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That slug is already in use. Choose another." };
    }
    return { ok: false, error: error.message };
  }

  const updated = data as Pick<PersonRow, "id" | "slug">;
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/tree");
  revalidatePath("/admin");
  revalidatePath(`/people/${updated.slug}`);
  revalidatePath(`/admin/people/${id}/edit`);
  return { ok: true, id: updated.id };
}

export async function deletePersonAction(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Only admins can delete people." };
  }

  const supabase = await createClient();
  const { data: personData } = await supabase
    .from("people")
    .select("slug, image_path")
    .eq("id", id)
    .single();
  const person = personData as Pick<PersonRow, "slug" | "image_path"> | null;

  const { error } = await supabase.from("people").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  if (person?.image_path) {
    await supabase.storage.from("media").remove([person.image_path]);
  }

  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/tree");
  revalidatePath("/admin");
  if (person?.slug) revalidatePath(`/people/${person.slug}`);
  redirect("/admin");
}

export async function uploadPersonImageAction(
  personId: string,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { ok: false, error: "You do not have permission to upload images." };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image file to upload." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Only image files are allowed." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "Images must be under 8 MB." };
  }

  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const path = `people/${personId}/${Date.now()}.${ext}`;

  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: existingData } = await supabase
    .from("people")
    .select("image_path, slug")
    .eq("id", personId)
    .single();
  const existing = existingData as Pick<
    PersonRow,
    "image_path" | "slug"
  > | null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return { ok: false, error: uploadError.message };

  const { error: updateError } = await supabase
    .from("people")
    .update({ image_path: path, updated_by: user?.id ?? null })
    .eq("id", personId);

  if (updateError) return { ok: false, error: updateError.message };

  if (existing?.image_path && existing.image_path !== path) {
    await supabase.storage.from("media").remove([existing.image_path]);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/people/${personId}/edit`);
  revalidatePath("/search");
  if (existing?.slug) revalidatePath(`/people/${existing.slug}`);
  return { ok: true, id: personId };
}

/**
 * Create a spouse profile for someone and link it both ways.
 * Used for wives who married into the clan (and husbands of daughters).
 */
export async function createSpouseProfileAction(
  personId: string,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { ok: false, error: "You do not have permission to add people." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { ok: false, error: "Enter the spouse’s name." };

  const genderRaw = String(formData.get("gender") ?? "female");
  const gender =
    genderRaw === "male" || genderRaw === "female" || genderRaw === "unknown"
      ? genderRaw
      : "female";
  const notes = String(formData.get("notes") ?? "").trim();

  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: personData, error: personError } = await supabase
    .from("people")
    .select("id, slug, full_name, spouse_id, marriage_date, marriage_place")
    .eq("id", personId)
    .single();
  if (personError || !personData) {
    return { ok: false, error: "Could not find that person." };
  }
  const person = personData as Pick<
    PersonRow,
    "id" | "slug" | "full_name" | "spouse_id" | "marriage_date" | "marriage_place"
  >;

  if (person.spouse_id) {
    return {
      ok: false,
      error: "A spouse profile is already linked. Edit or clear it first.",
    };
  }

  let slug = slugifyName(fullName);
  if (!slug) slug = `spouse-of-${person.slug}`;
  const { data: existingSlug } = await supabase
    .from("people")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

  const { data: createdData, error: createError } = await supabase
    .from("people")
    .insert({
      full_name: fullName,
      slug,
      gender,
      married_in: true,
      honorific: "Married into the family",
      spouse_id: person.id,
      spouse: person.full_name,
      marriage_date: person.marriage_date,
      marriage_place: person.marriage_place,
      bio: notes || null,
      created_by: user?.id ?? null,
      updated_by: user?.id ?? null,
    } satisfies PersonInsert)
    .select("id, slug")
    .single();

  if (createError || !createdData) {
    return {
      ok: false,
      error: createError?.message ?? "Could not create spouse profile.",
    };
  }
  const created = createdData as Pick<PersonRow, "id" | "slug">;

  const { error: linkError } = await supabase
    .from("people")
    .update({
      spouse_id: created.id,
      spouse: fullName,
      updated_by: user?.id ?? null,
    })
    .eq("id", personId);

  if (linkError) return { ok: false, error: linkError.message };

  // Attach as mother/father of this person's children when gender fits.
  const parentField = gender === "female" ? "mother_id" : "father_id";
  await supabase
    .from("people")
    .update({ [parentField]: created.id })
    .eq(gender === "female" ? "father_id" : "mother_id", personId)
    .is(parentField, null);

  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/tree");
  revalidatePath("/admin");
  revalidatePath(`/people/${person.slug}`);
  revalidatePath(`/people/${created.slug}`);
  revalidatePath(`/admin/people/${personId}/edit`);
  redirect(`/admin/people/${created.id}/edit?saved=1`);
}

/**
 * Create a new parent above someone (including the current root ancestor).
 * The new person becomes their father or mother; the tree will then treat
 * that parent as an ancestor generation above them.
 */
export async function addParentAboveAction(
  childId: string,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { ok: false, error: "You do not have permission to add people." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "father");
  if (!fullName) return { ok: false, error: "Enter the parent’s name." };
  if (role !== "father" && role !== "mother") {
    return { ok: false, error: "Choose father or mother." };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: childData, error: childError } = await supabase
    .from("people")
    .select("id, slug, father_id, mother_id")
    .eq("id", childId)
    .single();
  if (childError || !childData) {
    return { ok: false, error: "Could not find that person." };
  }
  const child = childData as Pick<
    PersonRow,
    "id" | "slug" | "father_id" | "mother_id"
  >;

  if (role === "father" && child.father_id) {
    return {
      ok: false,
      error: "A father is already linked. Clear or change it in Parents first.",
    };
  }
  if (role === "mother" && child.mother_id) {
    return {
      ok: false,
      error: "A mother is already linked. Clear or change it in Parents first.",
    };
  }

  let slug = slugifyName(fullName);
  if (!slug) slug = role;
  // Ensure unique slug
  const { data: existingSlug } = await supabase
    .from("people")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

  const { data: createdData, error: createError } = await supabase
    .from("people")
    .insert({
      full_name: fullName,
      slug,
      gender: role === "father" ? "male" : "female",
      honorific: role === "father" ? "Father" : "Mother",
      created_by: user?.id ?? null,
      updated_by: user?.id ?? null,
    } satisfies PersonInsert)
    .select("id, slug")
    .single();

  if (createError || !createdData) {
    return { ok: false, error: createError?.message ?? "Could not create parent." };
  }
  const created = createdData as Pick<PersonRow, "id" | "slug">;

  const patch =
    role === "father"
      ? { father_id: created.id, father_name: null, updated_by: user?.id ?? null }
      : { mother_id: created.id, mother_name: null, updated_by: user?.id ?? null };

  const { error: linkError } = await supabase
    .from("people")
    .update(patch)
    .eq("id", childId);

  if (linkError) {
    return { ok: false, error: linkError.message };
  }

  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/tree");
  revalidatePath("/admin");
  revalidatePath(`/people/${child.slug}`);
  revalidatePath(`/people/${created.slug}`);
  revalidatePath(`/admin/people/${childId}/edit`);
  redirect(`/admin/people/${created.id}/edit?saved=1`);
}

export async function removePersonImageAction(
  personId: string
): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { ok: false, error: "You do not have permission to remove images." };
  }

  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: existingData } = await supabase
    .from("people")
    .select("image_path, slug")
    .eq("id", personId)
    .single();
  const existing = existingData as Pick<
    PersonRow,
    "image_path" | "slug"
  > | null;

  if (existing?.image_path) {
    await supabase.storage.from("media").remove([existing.image_path]);
  }

  const { error } = await supabase
    .from("people")
    .update({ image_path: null, updated_by: user?.id ?? null })
    .eq("id", personId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/people/${personId}/edit`);
  revalidatePath("/search");
  if (existing?.slug) revalidatePath(`/people/${existing.slug}`);
  return { ok: true, id: personId };
}

// ---------------------------------------------------------------------------
// Places
// ---------------------------------------------------------------------------

function placeFormDataToObject(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    region: String(formData.get("region") ?? ""),
    description: String(formData.get("description") ?? ""),
    aliases: String(formData.get("aliases") ?? ""),
    sort_order: formData.get("sort_order")
      ? Number(formData.get("sort_order"))
      : null,
  };
}

function placeToDbPayload(
  values: ReturnType<typeof placeFormDataToObject>,
  userId: string | undefined,
  mode: "create" | "update"
): PlaceInsert {
  const base: PlaceInsert = {
    name: values.name.trim(),
    slug: values.slug.trim() || slugifyName(values.name),
    region: nullIfEmpty(values.region),
    description: values.description.trim(),
    aliases: parseAliases(values.aliases),
    sort_order: values.sort_order ?? null,
    updated_by: userId ?? null,
  };
  if (mode === "create") {
    return { ...base, created_by: userId ?? null };
  }
  return base;
}

export async function createPlaceAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { ok: false, error: "You do not have permission to add places." };
  }

  const raw = placeFormDataToObject(formData);
  if (!raw.slug.trim()) raw.slug = slugifyName(raw.name);
  const parsed = placeFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form",
    };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  const payload = placeToDbPayload(raw, user?.id, "create");

  const { data, error } = await supabase
    .from("places")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "That slug is already in use. Choose another.",
      };
    }
    return { ok: false, error: error.message };
  }

  const created = data as Pick<PlaceRow, "id" | "slug">;
  revalidatePath("/places");
  revalidatePath("/admin/places");
  redirect(`/admin/places/${created.id}/edit?saved=1`);
}

export async function updatePlaceAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { ok: false, error: "You do not have permission to edit places." };
  }

  const raw = placeFormDataToObject(formData);
  if (!raw.slug.trim()) raw.slug = slugifyName(raw.name);
  const parsed = placeFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form",
    };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  const payload = placeToDbPayload(raw, user?.id, "update");

  const { data, error } = await supabase
    .from("places")
    .update(payload)
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "That slug is already in use. Choose another.",
      };
    }
    return { ok: false, error: error.message };
  }

  const updated = data as Pick<PlaceRow, "id" | "slug">;
  revalidatePath("/places");
  revalidatePath("/admin/places");
  revalidatePath(`/admin/places/${updated.id}/edit`);
  return { ok: true, id: updated.id };
}

export async function deletePlaceAction(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Only admins can delete places." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("places").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/places");
  revalidatePath("/admin/places");
  redirect("/admin/places");
}
