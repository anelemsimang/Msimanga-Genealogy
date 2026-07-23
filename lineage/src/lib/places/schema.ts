import { z } from "zod";

export const placeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens"
    ),
  region: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  aliases: z.string().trim().optional().or(z.literal("")),
  sort_order: z.coerce.number().int().optional().nullable(),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;

/** Split a comma-separated aliases field into a clean string array. */
export function parseAliases(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}
