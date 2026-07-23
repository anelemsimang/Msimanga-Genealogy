import type { TranslationKey } from "@/lib/i18n/dictionaries";

export const siteConfig = {
  name: "Msimanga",
  fullName: "Usapho lakwaMsimanga",
  tagline: "The Msimanga Family Archive",
  // Primary public navigation (visible to all visitors).
  nav: [
    { key: "nav.tree", href: "/tree" },
    { key: "nav.people", href: "/search" },
    { key: "nav.surnames", href: "/surnames" },
    { key: "nav.places", href: "/places" },
    { key: "nav.media", href: "/media" },
    { key: "nav.timeline", href: "/timeline" },
  ],
} as const;

export type NavItem = {
  key: TranslationKey;
  href: string;
};
