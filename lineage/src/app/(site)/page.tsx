import Link from "next/link";
import {
  GitBranch,
  BookMarked,
  Users,
  ShieldCheck,
  ArrowRight,
  History,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeroSearch } from "@/components/hero-search";
import { IzithakazeloSection } from "@/components/izithakazelo-section";
import { BrandMark } from "@/components/brand";
import { PersonAvatar } from "@/components/person-avatar";
import { t } from "@/lib/i18n/dictionaries";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { clanName, izithakazeloShort } from "@/lib/clan";
import { getPersonBySlug, countPeople } from "@/lib/people/service";

type Feature = {
  icon: LucideIcon;
  titleKey: TranslationKey;
  descKey: TranslationKey;
};

const features: Feature[] = [
  {
    icon: GitBranch,
    titleKey: "feature.tree.title",
    descKey: "feature.tree.desc",
  },
  {
    icon: BookMarked,
    titleKey: "feature.sources.title",
    descKey: "feature.sources.desc",
  },
  {
    icon: Users,
    titleKey: "feature.family.title",
    descKey: "feature.family.desc",
  },
  {
    icon: ShieldCheck,
    titleKey: "feature.privacy.title",
    descKey: "feature.privacy.desc",
  },
];

export default async function HomePage() {
  const [featured, total] = await Promise.all([
    getPersonBySlug("hlomza"),
    countPeople(),
  ]);

  const recentActivity: { icon: LucideIcon; label: string; href: string }[] = [
    { icon: GitBranch, label: "The interactive family tree is live", href: "/tree" },
    {
      icon: Users,
      label: `All ${total} people from the record added`,
      href: "/search",
    },
    { icon: ScrollText, label: "The source record is documented", href: "/sources" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.accent/45),transparent_60%)]"
        />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:gap-7 sm:px-6 sm:py-20 md:py-28">
          <Badge variant="secondary" className="gap-1.5 py-1.5 pl-1.5 pr-3">
            <BrandMark className="size-4" />
            {t("hero.badge")}
          </Badge>

          <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight tracking-tight text-balance break-words hyphens-auto sm:text-5xl md:text-6xl">
            {t("hero.titleBefore")}
            <span translate="no" className="notranslate text-primary">
              {clanName}
            </span>
            {t("hero.titleAfter")}
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
            {t("hero.subtitle")}
          </p>

          {/* Izithakazelo strip — praise names stay in their original form */}
          <p
            translate="no"
            className="notranslate flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-heading text-sm italic text-muted-foreground/80"
          >
            {izithakazeloShort.map((name, i) => (
              <span key={name} className="flex items-center gap-3">
                {i > 0 && (
                  <span aria-hidden className="text-primary/50">
                    &bull;
                  </span>
                )}
                {name}
              </span>
            ))}
          </p>

          <HeroSearch />

          <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Button
              render={<Link href="/tree" />}
              nativeButton={false}
              size="lg"
              className="h-auto min-h-11 whitespace-normal sm:whitespace-nowrap"
            >
              {t("hero.exploreTree")}
              <ArrowRight className="size-4 shrink-0" />
            </Button>
            <Button
              render={<Link href="/auth/sign-in" />}
              nativeButton={false}
              size="lg"
              variant="outline"
              className="min-h-11"
            >
              {t("hero.signIn")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.titleKey} className="border-border/60">
              <CardHeader>
                <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <CardTitle className="font-heading text-lg">
                  {t(f.titleKey)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {t(f.descKey)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Izithakazelo */}
      <IzithakazeloSection />

      {/* Featured + Recent activity */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3 md:py-20">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                {t("featured.title")}
              </CardTitle>
              <CardDescription>{t("featured.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {featured ? (
                <Link
                  href={`/people/${featured.slug}`}
                  className="group flex flex-col gap-4 rounded-lg border p-5 transition-colors hover:border-primary/40 hover:bg-accent/30 sm:flex-row sm:items-center"
                >
                  <PersonAvatar
                    name={featured.full_name}
                    gender={featured.gender}
                    imageUrl={featured.imageUrl}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-lg font-semibold group-hover:text-primary">
                      {featured.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {featured.honorific}
                    </p>
                    {featured.bio && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                        {featured.bio}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="hidden size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block" />
                </Link>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-14 text-center">
                  <Users className="size-8 text-muted-foreground" />
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {t("featured.empty")}
                  </p>
                  <Button
                    render={<Link href="/tree" />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                  >
                    {t("featured.openTree")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xl">
                <History className="size-5" />
                {t("recent.title")}
              </CardTitle>
              <CardDescription>{t("recent.desc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {recentActivity.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-primary/40 hover:bg-accent/30"
                >
                  <item.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm font-medium group-hover:text-primary">
                    {item.label}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
