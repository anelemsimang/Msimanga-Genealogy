import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { BrandMark } from "@/components/brand";
import { t } from "@/lib/i18n/dictionaries";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <div
            translate="no"
            className="notranslate flex items-center gap-2 font-heading text-lg font-semibold"
          >
            <BrandMark className="size-6" />
            {siteConfig.fullName}
          </div>
          <p className="text-sm text-muted-foreground">{t("footer.description")}</p>
        </div>

        <nav className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3 sm:gap-x-10">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md py-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href="/whats-new"
            className="rounded-md py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("footer.recentChanges")}
          </Link>
          <Link
            href="/sources"
            className="rounded-md py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("footer.sources")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:px-6">
          <span>
            © {new Date().getFullYear()} {siteConfig.fullName}.{" "}
            {t("footer.rights")}
          </span>
          <span>Design by Anele Andza Msimang.</span>
        </div>
      </div>
    </footer>
  );
}
