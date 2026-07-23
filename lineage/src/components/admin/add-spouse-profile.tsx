"use client";

import * as React from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSpouseProfileAction } from "@/app/admin/actions";

/**
 * Quick-create a full profile for a spouse (typically a wife who married in),
 * link it both ways, and open their edit page.
 */
export function AddSpouseProfile({
  personId,
  personName,
  hasLinkedSpouse,
  defaultName,
  defaultGender = "female",
}: {
  personId: string;
  personName: string;
  hasLinkedSpouse: boolean;
  defaultName?: string | null;
  defaultGender?: "male" | "female" | "unknown";
}) {
  const [pending, setPending] = React.useState(false);

  if (hasLinkedSpouse) return null;

  const onSubmit = async (formData: FormData) => {
    setPending(true);
    const result = await createSpouseProfileAction(personId, formData);
    if (result && !result.ok) {
      toast.error("Could not create spouse", { description: result.error });
      setPending(false);
    }
  };

  return (
    <section className="rounded-xl border border-chart-4/30 bg-chart-4/5 p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-chart-4/15 text-chart-4">
          <Heart className="size-5" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Create spouse profile
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Give {personName}&rsquo;s spouse their own page — photo, bio, and
            life events — even though their parents are outside this archive.
          </p>
        </div>
      </div>

      <form
        action={onSubmit}
        className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="spouse_full_name">Spouse&rsquo;s full name</Label>
          <Input
            id="spouse_full_name"
            name="full_name"
            required
            defaultValue={defaultName ?? ""}
            placeholder="e.g. Mamashiya"
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="spouse_gender">Gender</Label>
          <select
            id="spouse_gender"
            name="gender"
            defaultValue={defaultGender}
            disabled={pending}
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Heart className="size-4" />
          )}
          {pending ? "Creating…" : "Create profile"}
        </Button>
        <input type="hidden" name="notes" value={defaultName ?? ""} />
      </form>
    </section>
  );
}
