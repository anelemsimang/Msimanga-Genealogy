"use client";

import * as React from "react";

/**
 * Google Translate engine integration.
 *
 * The site is authored in English; this provider injects the Google Website
 * Translate widget (its chrome is hidden via CSS) and exposes a small API for a
 * custom language switcher to translate the whole page. The chosen language is
 * stored in Google's `googtrans` cookie so it persists across reloads and
 * navigation; on load we drive Google's hidden <select> from that cookie.
 */

export type TranslateLang = "en" | "zu" | "xh" | "st";

export const translateLanguages: { code: TranslateLang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zu", label: "isiZulu" },
  { code: "xh", label: "isiXhosa" },
  { code: "st", label: "Sesotho" },
];

const INCLUDED = "en,zu,xh,st";

type TranslateContextValue = {
  language: TranslateLang;
  setLanguage: (lang: TranslateLang) => void;
  ready: boolean;
};

const TranslateContext = React.createContext<TranslateContextValue | null>(null);

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function isTranslateLang(value: string | undefined): value is TranslateLang {
  return value === "en" || value === "zu" || value === "xh" || value === "st";
}

/** Read the active target language from the googtrans cookie. */
function readCookieLang(): TranslateLang {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]*\/([^;]+)/);
  const value = match?.[1];
  return isTranslateLang(value) ? value : "en";
}

/** Set (or clear) the googtrans cookie across host + dotted-domain variants. */
function writeCookie(lang: TranslateLang) {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const domains = ["", `; domain=${host}`, `; domain=.${host}`];

  for (const domain of domains) {
    if (lang === "en") {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/${domain}`;
    }
  }
}

/**
 * Drive Google's hidden language <select> to a target language. Polls briefly
 * because the widget's combo appears a moment after the script initializes.
 */
function applyToCombo(lang: TranslateLang, attempt = 0) {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) {
    if (attempt < 40) {
      window.setTimeout(() => applyToCombo(lang, attempt + 1), 150);
    }
    return;
  }
  if (combo.value !== lang) {
    combo.value = lang;
    combo.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

export function GoogleTranslateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = React.useState<TranslateLang>("en");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const cookieLang = readCookieLang();
    setLanguageState(cookieLang);

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      // eslint-disable-next-line new-cap
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: INCLUDED,
          autoDisplay: false,
        },
        "google_translate_element"
      );
      setReady(true);
      // Re-apply the saved language on load (Google doesn't always honour the
      // cookie automatically), so translation persists across reloads.
      const saved = readCookieLang();
      if (saved !== "en") applyToCombo(saved);
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.googleapis.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      setReady(true);
      const saved = readCookieLang();
      if (saved !== "en") applyToCombo(saved);
    }
  }, []);

  const setLanguage = React.useCallback((lang: TranslateLang) => {
    writeCookie(lang);
    setLanguageState(lang);
    // Reload so the choice is applied cleanly and consistently. The init
    // callback re-drives Google's combo from the cookie after reload.
    window.location.reload();
  }, []);

  const value = React.useMemo(
    () => ({ language, setLanguage, ready }),
    [language, setLanguage, ready]
  );

  return (
    <TranslateContext.Provider value={value}>
      {/* Hidden host element required by the Google Translate widget. */}
      <div id="google_translate_element" className="sr-only" aria-hidden />
      {children}
    </TranslateContext.Provider>
  );
}

export function useTranslate() {
  const ctx = React.useContext(TranslateContext);
  if (!ctx) {
    throw new Error("useTranslate must be used within a GoogleTranslateProvider");
  }
  return ctx;
}
