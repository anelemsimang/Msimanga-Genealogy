import { izithakazelo } from "@/lib/clan";
import { t } from "@/lib/i18n/dictionaries";

export function IzithakazeloSection() {
  return (
    <section className="border-t bg-card">
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            {t("clan.subheading")}
          </p>
          {/* Heading is a praise term — keep it in its original form. */}
          <h2
            translate="no"
            className="notranslate mt-2 font-heading text-3xl font-semibold sm:text-4xl"
          >
            {t("clan.heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
            {t("clan.intro")}
          </p>
        </div>

        <div className="relative rounded-2xl border bg-gradient-to-b from-accent/30 to-transparent p-8 sm:p-12">
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-2 select-none font-heading text-7xl leading-none text-primary/15 sm:text-8xl"
          >
            &ldquo;
          </span>
          {/* The izithakazelo must never be machine-translated. */}
          <ol
            translate="no"
            className="notranslate relative space-y-1.5 text-center"
          >
            {izithakazelo.map((line, i) => (
              <li
                key={line}
                className="font-heading text-lg leading-relaxed text-foreground/90 text-balance sm:text-xl"
                style={{ opacity: 1 - i * 0.012 }}
              >
                {line}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
