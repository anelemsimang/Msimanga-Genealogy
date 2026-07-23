import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7 text-primary", className)}
      aria-hidden="true"
    >
      {/* Stylized family tree: a trunk branching to three nodes */}
      <path
        d="M16 30V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 17L7 9M16 17l9-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="17" r="2.5" fill="currentColor" />
      <circle cx="7" cy="7" r="3.5" fill="currentColor" opacity="0.85" />
      <circle cx="25" cy="7" r="3.5" fill="currentColor" opacity="0.85" />
      <circle cx="16" cy="4" r="3" fill="currentColor" opacity="0.55" />
      <path
        d="M16 7v7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex min-w-0 shrink items-center gap-2 font-heading",
        className
      )}
    >
      <BrandMark className="shrink-0" />
      <span
        translate="no"
        className="notranslate truncate text-lg font-semibold tracking-tight sm:text-xl"
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}
