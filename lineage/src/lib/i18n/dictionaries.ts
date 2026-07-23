/**
 * English UI copy — the single source of truth for all interface text.
 *
 * The whole site is authored in English. On-demand translation into other
 * languages (isiZulu, isiXhosa, Sesotho) is handled at runtime by the Google
 * Translate engine (see `GoogleTranslateProvider`), which translates the
 * rendered page. Text that must never be translated (e.g. the izithakazelo)
 * is marked with the `notranslate` class / `translate="no"` attribute.
 */
const en = {
  // Navigation
  "nav.tree": "Tree",
  "nav.people": "People",
  "nav.surnames": "Surnames",
  "nav.places": "Places",
  "nav.media": "Media",
  "nav.timeline": "Timeline",

  // Header
  "header.signIn": "Sign in",
  "header.searchAria": "Search the archive",
  "header.openMenu": "Open menu",
  "header.language": "Language",

  // Hero
  "hero.badge": "The Msimanga Family Archive",
  "hero.titleBefore": "Preserving the ",
  "hero.titleAfter": " family, together.",
  "hero.subtitle":
    "A dedicated home for the Msimanga family's history — our people, our places, and the izithakazelo carried down through the generations.",
  "hero.searchPlaceholder": "Search for a family member by name…",
  "hero.searchButton": "Search",
  "hero.exploreTree": "Explore our family tree",
  "hero.signIn": "Family member sign in",

  // Izithakazelo section
  "clan.heading": "Izithakazelo zakwaMsimanga",
  "clan.subheading": "Our clan praises",
  "clan.intro":
    "The praise names handed down through the Msimanga line — recited to honour those who came before us.",

  // Features
  "feature.tree.title": "Our living family tree",
  "feature.tree.desc":
    "An interactive tree of the Msimanga family you can explore across the generations.",
  "feature.sources.title": "Every fact is sourced",
  "feature.sources.desc":
    "Attach records and citations to every date, place, and relationship — a history you can trust.",
  "feature.family.title": "Built by the family",
  "feature.family.desc":
    "Family members add to and refine the record together, with every change carefully preserved.",
  "feature.privacy.title": "Privacy by default",
  "feature.privacy.desc":
    "Living relatives' sensitive details stay protected. The family decides who sees what.",

  // Featured ancestor
  "featured.title": "Featured ancestor",
  "featured.desc": "A spotlight on a person from the family archive.",
  "featured.empty":
    "Once the archive has family members, a featured ancestor will appear here. Add your first family member to begin.",
  "featured.openTree": "Open the tree",

  // Recent activity
  "recent.title": "Recent activity",
  "recent.desc": "Latest updates to the family archive.",
  "recent.empty":
    "No changes yet. Recent contributions will appear here as the family builds the record.",

  // Footer
  "footer.description":
    "A dedicated archive for the Msimanga family — our tree, our people, and our heritage.",
  "footer.recentChanges": "Recent changes",
  "footer.sources": "Sources",
  "footer.rights": "A dedicated Msimanga family archive.",
} as const;

export type TranslationKey = keyof typeof en;

/** Look up English UI copy by key. */
export function t(key: TranslationKey): string {
  return en[key];
}
