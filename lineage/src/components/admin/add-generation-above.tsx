"use client";

import * as React from "react";
import { ArrowUpFromLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addParentAboveAction } from "@/app/admin/actions";

/**
 * Quick way to insert a father or mother above the person being edited —
 * including above today's root ancestor. Creates the parent, links them,
 * then opens their edit page so you can add more detail.
 */
export function AddGenerationAbove({
  personId,
  personName,
  hasFather,
  hasMother,
}: {
  personId: string;
  personName: string;
  hasFather: boolean;
  hasMother: boolean;
}) {
  const [pending, setPending] = React.useState(false);

  if (hasFather && hasMother) return null;

  const onSubmit = async (formData: FormData) => {
    setPending(true);
    const result = await addParentAboveAction(personId, formData);
    // On success the action redirects to the new parent's edit page.
    // If we still get a result, it failed.
    if (result && !result.ok) {
      toast.error("Could not add parent", { description: result.error });
      setPending(false);
    }
  };

  return (
    <section className="rounded-xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ArrowUpFromLine className="size-5" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Add a generation above
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Create a parent for {personName}. They will appear above this person
            on the family tree (useful for extending beyond the current root).
            For a spouse, use the Marriage section below.
          </p>
        </div>
      </div>

      <form action={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="parent_full_name">Parent’s full name</Label>
          <Input
            id="parent_full_name"
            name="full_name"
            required
            placeholder="e.g. Unknown Msimanga"
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="parent_role">As</Label>
          <select
            id="parent_role"
            name="role"
            defaultValue={hasFather ? "mother" : "father"}
            disabled={pending}
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {!hasFather && <option value="father">Father</option>}
            {!hasMother && <option value="mother">Mother</option>}
          </select>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUpFromLine className="size-4" />
          )}
          {pending ? "Adding…" : "Add parent"}
        </Button>
      </form>
    </section>
  );
}
