import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand";

/** Elegant branded spinner used for route and section loading states. */
export function BrandLoader({
  className,
  label = "Loading…",
  fullPage = false,
}: {
  className?: string;
  label?: string;
  /** Fill the viewport / main area (route loading screens). */
  fullPage?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-5",
        fullPage
          ? "min-h-[min(70vh,36rem)] w-full px-6 py-16"
          : "py-10",
        className
      )}
    >
      <div className="relative size-14 sm:size-16">
        <svg
          viewBox="0 0 48 48"
          className="brand-loader-ring size-full text-primary"
          aria-hidden="true"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            className="opacity-15"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeDasharray="28 100"
            className="brand-loader-arc origin-center"
          />
        </svg>
        <BrandMark className="absolute inset-0 m-auto size-6 opacity-80 sm:size-7" />
      </div>
      <p className="font-heading text-sm tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <span className="sr-only">{label}</span>
    </div>
  );
}
