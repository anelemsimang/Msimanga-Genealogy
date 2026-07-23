import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared hero/header strip for interior pages so every page opens with a
 * consistent title, eyebrow, and description.
 */
export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b bg-muted/20", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-12">
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 flex flex-wrap items-start gap-2.5 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {Icon && <Icon className="mt-1 size-7 shrink-0 text-primary" />}
          <span className="min-w-0">{title}</span>
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
