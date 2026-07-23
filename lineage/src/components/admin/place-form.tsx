"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Save, Trash2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPlaceAction,
  updatePlaceAction,
  deletePlaceAction,
} from "@/app/admin/actions";
import { slugifyName } from "@/lib/people/schema";
import type { PlaceRow } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

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

export function PlaceForm({
  place,
  canDelete = false,
}: {
  place?: PlaceRow;
  canDelete?: boolean;
}) {
  const router = useRouter();
  const [slug, setSlug] = React.useState(place?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(place));
  const [deleting, setDeleting] = React.useState(false);

  const onAction = async (formData: FormData) => {
    const result = place
      ? await updatePlaceAction(place.id, null, formData)
      : await createPlaceAction(null, formData);
    if (result && "ok" in result) {
      if (result.ok) {
        toast.success("Place saved");
        router.refresh();
      } else {
        toast.error("Could not save place", { description: result.error });
      }
    }
  };

  const onDelete = async () => {
    if (!place) return;
    if (!confirm(`Delete “${place.name}”? This cannot be undone.`)) return;
    setDeleting(true);
    const result = await deletePlaceAction(place.id);
    if (result && !result.ok) {
      toast.error("Could not delete", { description: result.error });
      setDeleting(false);
    }
  };

  return (
    <form action={onAction} className="space-y-6">
      <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="font-heading text-lg font-semibold">Location</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Districts, villages, and areas named as you gather family history.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" className="sm:col-span-2">
            <Input
              id="name"
              name="name"
              required
              defaultValue={place?.name ?? ""}
              placeholder="e.g. Mount Fletcher"
              onChange={(e) => {
                if (!slugTouched) setSlug(slugifyName(e.target.value));
              }}
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="slug"
            hint="Used in URLs. Usually leave as auto-filled."
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
          <Field
            label="Region / parent area"
            htmlFor="region"
            hint='e.g. "Eastern Cape" or "Mount Fletcher"'
          >
            <Input
              id="region"
              name="region"
              defaultValue={place?.region ?? ""}
              placeholder="Eastern Cape"
            />
          </Field>
          <Field
            label="Aliases"
            htmlFor="aliases"
            hint="Other spellings, comma-separated — used to match people notes."
            className="sm:col-span-2"
          >
            <Input
              id="aliases"
              name="aliases"
              defaultValue={(place?.aliases ?? []).join(", ")}
              placeholder="e.g. Bhubesi"
            />
          </Field>
          <Field
            label="Description"
            htmlFor="description"
            className="sm:col-span-2"
          >
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={place?.description ?? ""}
              placeholder="Why this place matters in the family story…"
            />
          </Field>
          <Field
            label="Sort order"
            htmlFor="sort_order"
            hint="Lower numbers appear first. Leave blank for alphabetical."
          >
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={place?.sort_order ?? ""}
            />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={place ? "Save place" : "Create place"} />
        {place && (
          <Button
            render={<Link href="/places" target="_blank" />}
            nativeButton={false}
            variant="outline"
          >
            <ExternalLink className="size-4" /> View public page
          </Button>
        )}
        <Button
          render={<Link href="/admin/places" />}
          nativeButton={false}
          variant="ghost"
        >
          Cancel
        </Button>
        {place && canDelete && (
          <Button
            type="button"
            variant="destructive"
            className="ml-auto"
            disabled={deleting}
            onClick={onDelete}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
