import { z } from "zod";

/**
 * Shared validation for creating / updating a person from the admin form.
 * Dates stay free-text so historical / approximate dates (e.g. "c. 1900") work.
 */
export const personFormSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  gender: z.enum(["male", "female", "unknown"]),
  honorific: z.string().trim().optional().or(z.literal("")),
  house: z.string().trim().optional().or(z.literal("")),
  father_id: z.string().uuid().optional().or(z.literal("")),
  mother_id: z.string().uuid().optional().or(z.literal("")),
  father_name: z.string().trim().optional().or(z.literal("")),
  mother_name: z.string().trim().optional().or(z.literal("")),
  spouse: z.string().trim().optional().or(z.literal("")),
  spouse_id: z.string().uuid().optional().or(z.literal("")),
  married_in: z.boolean().optional(),
  birth_date: z.string().trim().optional().or(z.literal("")),
  birth_place: z.string().trim().optional().or(z.literal("")),
  death_date: z.string().trim().optional().or(z.literal("")),
  death_place: z.string().trim().optional().or(z.literal("")),
  burial_date: z.string().trim().optional().or(z.literal("")),
  burial_place: z.string().trim().optional().or(z.literal("")),
  marriage_date: z.string().trim().optional().or(z.literal("")),
  marriage_place: z.string().trim().optional().or(z.literal("")),
  bio: z.string().trim().optional().or(z.literal("")),
  is_living: z.boolean().optional(),
  sort_order: z.coerce.number().int().optional().nullable(),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Convert empty strings to null for DB writes. */
export function nullIfEmpty(value: string | undefined | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
