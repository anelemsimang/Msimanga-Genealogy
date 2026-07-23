import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Gender } from "@/lib/supabase/types";

const genderStyles: Record<Gender, string> = {
  male: "bg-chart-3/15 text-chart-3",
  female: "bg-chart-4/15 text-chart-4",
  unknown: "bg-muted text-muted-foreground",
};

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-24 text-2xl",
  card: "size-40 text-3xl sm:size-44",
} as const;

const pixelSize = { sm: 32, md: 40, lg: 56, xl: 96, card: 176 } as const;

/** Two-letter initials for a name, ignoring the shared surname. */
export function personInitials(name: string): string {
  const parts = name
    .replace(/msimanga/i, "")
    .replace(/["“”()]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * A person's photo when available, otherwise gender-tinted initials.
 */
export function PersonAvatar({
  name,
  gender,
  imageUrl,
  size = "md",
  className,
}: {
  name: string;
  gender: Gender;
  imageUrl?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-1 ring-border",
          sizes[size],
          className
        )}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes={`${pixelSize[size]}px`}
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-heading font-semibold",
        sizes[size],
        genderStyles[gender],
        className
      )}
    >
      {personInitials(name)}
    </span>
  );
}
