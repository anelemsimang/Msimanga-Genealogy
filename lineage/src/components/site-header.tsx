"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { t } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import * as React from "react";

export function SiteHeader({
  authSlot,
}: {
  authSlot?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <Brand className="min-w-0" />

        <nav className="ml-2 hidden items-center gap-0.5 lg:ml-4 lg:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive(item.href) && "text-foreground"
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <Button
            render={<Link href="/search" />}
            nativeButton={false}
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label={t("header.searchAria")}
          >
            <Search className="size-5" />
          </Button>
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <div className="ml-1 hidden sm:block">
            {authSlot ?? (
              <Button
                render={<Link href="/auth/sign-in" />}
                nativeButton={false}
                size="sm"
              >
                {t("header.signIn")}
              </Button>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 lg:hidden"
                  aria-label={t("header.openMenu")}
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,100vw)]">
              <SheetHeader>
                <SheetTitle>
                  <Brand />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-0.5 px-2">
                {siteConfig.nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive(item.href) && "bg-accent text-accent-foreground"
                    )}
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <div className="mt-4 flex items-center justify-between gap-2 border-t px-1 pt-4 sm:hidden">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
                <div className="mt-3" onClick={() => setOpen(false)}>
                  {authSlot ?? (
                    <Button
                      render={<Link href="/auth/sign-in" />}
                      nativeButton={false}
                      className="w-full"
                    >
                      {t("header.signIn")}
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
