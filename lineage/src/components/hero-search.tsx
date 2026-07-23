"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/dictionaries";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-xl min-w-0 items-center gap-1.5 rounded-full border bg-card p-1.5 shadow-sm sm:gap-2"
    >
      <Search className="ml-2 size-5 shrink-0 text-muted-foreground sm:ml-3" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("hero.searchPlaceholder")}
        aria-label={t("hero.searchPlaceholder")}
        className="min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <Button
        type="submit"
        size="icon"
        className="size-10 shrink-0 rounded-full sm:hidden"
        aria-label={t("hero.searchButton")}
      >
        <Search className="size-4" />
      </Button>
      <Button
        type="submit"
        className="hidden shrink-0 rounded-full px-5 sm:inline-flex sm:px-6"
      >
        {t("hero.searchButton")}
      </Button>
    </form>
  );
}
