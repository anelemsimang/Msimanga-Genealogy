"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  Save,
  Trash2,
  Upload,
  ExternalLink,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  createPersonAction,
  updatePersonAction,
  deletePersonAction,
  uploadPersonImageAction,
  removePersonImageAction,
} from "@/app/admin/actions";
import { slugifyName } from "@/lib/people/schema";
import type { Person } from "@/lib/people/service";
import { cn } from "@/lib/utils";

type Option = { id: string; full_name: string };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Save className="size-4" />
      )}
      {pending ? "Saving…" : label}
    </Button>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function DatePlaceRow({
  label,
  dateName,
  placeName,
  dateDefault,
  placeDefault,
}: {
  label: string;
  dateName: string;
  placeName: string;
  dateDefault?: string | null;
  placeDefault?: string | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[7rem_1fr_1fr] sm:items-end">
      <p className="pb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <Field label="Date" htmlFor={dateName}>
        <Input
          id={dateName}
          name={dateName}
          defaultValue={dateDefault ?? ""}
          placeholder="e.g. 26 Apr 1859"
        />
      </Field>
      <Field label="Place" htmlFor={placeName}>
        <Input
          id={placeName}
          name={placeName}
          defaultValue={placeDefault ?? ""}
          placeholder="Town, region / country"
        />
      </Field>
    </div>
  );
}

export function PersonForm({
  person,
  peopleOptions,
  canDelete,
}: {
  person?: Person;
  peopleOptions: Option[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const isEdit = Boolean(person);
  const [slug, setSlug] = React.useState(person?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(isEdit);
  const [imageUrl, setImageUrl] = React.useState(person?.imageUrl ?? null);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const onAction = async (formData: FormData) => {
    const result = person
      ? await updatePersonAction(person.id, null, formData)
      : await createPersonAction(null, formData);
    // createPersonAction redirects on success; update returns a result.
    if (result && "ok" in result) {
      if (result.ok) {
        toast.success("Saved");
        router.refresh();
      } else {
        toast.error("Could not save", { description: result.error });
      }
    }
  };

  const onNameChange = (value: string) => {
    if (!slugTouched) setSlug(slugifyName(value));
  };

  const onUpload = async (file: File) => {
    if (!person) {
      toast.message("Save the person first, then add a photo.");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.set("image", file);
    const result = await uploadPersonImageAction(person.id, fd);
    setUploading(false);
    if (!result.ok) {
      toast.error("Upload failed", { description: result.error });
      return;
    }
    toast.success("Photo updated");
    router.refresh();
  };

  const onRemoveImage = async () => {
    if (!person) return;
    const result = await removePersonImageAction(person.id);
    if (!result.ok) {
      toast.error("Could not remove photo", { description: result.error });
      return;
    }
    setImageUrl(null);
    toast.success("Photo removed");
    router.refresh();
  };

  const onDelete = async () => {
    if (!person || !canDelete) return;
    if (
      !confirm(
        `Delete ${person.full_name}? This cannot be undone.`
      )
    ) {
      return;
    }
    const result = await deletePersonAction(person.id);
    if (result && !result.ok) {
      toast.error("Could not delete", { description: result.error });
    }
  };

  React.useEffect(() => {
    setImageUrl(person?.imageUrl ?? null);
  }, [person?.imageUrl]);

  return (
    <div className="space-y-6">
      <form action={onAction} className="space-y-6">
        {/* Identity */}
        <SectionCard
          title="Identity"
          description="The name and how this person appears across the site."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="full_name" className="sm:col-span-2">
              <Input
                id="full_name"
                name="full_name"
                required
                defaultValue={person?.full_name ?? ""}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g. Matshakeni Mphuthunywa Msimanga"
              />
            </Field>
            <Field
              label="URL slug"
              htmlFor="slug"
              hint="Used in the profile link, e.g. /people/matshakeni"
            >
              <Input
                id="slug"
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            </Field>
            <Field label="Gender" htmlFor="gender">
              <select
                id="gender"
                name="gender"
                defaultValue={person?.gender ?? "unknown"}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>
            <Field label="Honorific / order" htmlFor="honorific">
              <Input
                id="honorific"
                name="honorific"
                defaultValue={person?.honorific ?? ""}
                placeholder="e.g. Eldest son, last-born twin"
              />
            </Field>
            <Field label="House / branch" htmlFor="house">
              <Input
                id="house"
                name="house"
                defaultValue={person?.house ?? ""}
                placeholder="e.g. Branch 5 — House of Matshakeni"
              />
            </Field>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input
                type="checkbox"
                name="is_living"
                defaultChecked={person?.is_living ?? false}
                className="size-4 rounded border"
              />
              Living person (extra privacy later)
            </label>
          </div>
        </SectionCard>

        {/* Photo — only for existing people */}
        {isEdit && (
          <SectionCard
            title="Photograph"
            description="Shown on their profile card and in the people directory."
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={person!.full_name}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                ) : (
                  <ImageIcon className="size-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onUpload(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {uploading ? "Uploading…" : "Upload photo"}
                </Button>
                {imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void onRemoveImage()}
                  >
                    Remove photo
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WebP up to 8 MB.
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Life events */}
        <SectionCard
          title="Life events"
          description="Dates can be approximate or written in any style — leave blank if unknown."
        >
          <div className="space-y-4">
            <DatePlaceRow
              label="Birth"
              dateName="birth_date"
              placeName="birth_place"
              dateDefault={person?.birth_date}
              placeDefault={person?.birth_place}
            />
            <Separator />
            <DatePlaceRow
              label="Death"
              dateName="death_date"
              placeName="death_place"
              dateDefault={person?.death_date}
              placeDefault={person?.death_place}
            />
            <Separator />
            <DatePlaceRow
              label="Burial"
              dateName="burial_date"
              placeName="burial_place"
              dateDefault={person?.burial_date}
              placeDefault={person?.burial_place}
            />
            <Separator />
            <DatePlaceRow
              label="Marriage"
              dateName="marriage_date"
              placeName="marriage_place"
              dateDefault={person?.marriage_date}
              placeDefault={person?.marriage_place}
            />
            <Separator />
            <Field
              label="Spouse (linked profile)"
              htmlFor="spouse_id"
              hint="Prefer linking a full profile so wives appear like everyone else."
            >
              <select
                id="spouse_id"
                name="spouse_id"
                defaultValue={person?.spouse_id ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">— None —</option>
                {peopleOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Spouse name / notes"
              htmlFor="spouse"
              hint='Fallback text, e.g. "Mankosi (of the Ludidi house)"'
            >
              <Input
                id="spouse"
                name="spouse"
                defaultValue={person?.spouse ?? ""}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="married_in"
                defaultChecked={person?.married_in ?? false}
                className="size-4 rounded border"
              />
              Married into the family (not of the Msimanga bloodline)
            </label>
          </div>
        </SectionCard>

        {/* Parents */}
        <SectionCard
          title="Parents"
          description="Link parents already in the archive, or use “Add a generation above” to create a new father/mother (including above the root ancestor)."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Father (linked)" htmlFor="father_id">
              <select
                id="father_id"
                name="father_id"
                defaultValue={person?.father_id ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">— None —</option>
                {peopleOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Father name (text)" htmlFor="father_name">
              <Input
                id="father_name"
                name="father_name"
                defaultValue={person?.father_name ?? ""}
                placeholder="If not linked above"
              />
            </Field>
            <Field label="Mother (linked)" htmlFor="mother_id">
              <select
                id="mother_id"
                name="mother_id"
                defaultValue={person?.mother_id ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">— None —</option>
                {peopleOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mother name (text)" htmlFor="mother_name">
              <Input
                id="mother_name"
                name="mother_name"
                defaultValue={person?.mother_name ?? ""}
                placeholder="If not linked above"
              />
            </Field>
          </div>
        </SectionCard>

        {/* Bio */}
        <SectionCard
          title="About / mini biography"
          description="Stories, notes from the family record, or anything worth remembering."
        >
          <Textarea
            id="bio"
            name="bio"
            rows={8}
            defaultValue={person?.bio ?? ""}
            placeholder="Write a short biography or paste notes from the family record…"
            className="min-h-40"
          />
        </SectionCard>

        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
          <div className="flex flex-wrap gap-2">
            <SubmitButton label={isEdit ? "Save changes" : "Create person"} />
            {person && (
              <Button
                render={<Link href={`/people/${person.slug}`} target="_blank" />}
                nativeButton={false}
                variant="outline"
                size="lg"
              >
                <ExternalLink className="size-4" /> View profile
              </Button>
            )}
          </div>
          {isEdit && canDelete && (
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={() => void onDelete()}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
