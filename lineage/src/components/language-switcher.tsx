"use client";

import { Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  translateLanguages,
  useTranslate,
} from "@/components/providers/google-translate-provider";
import { t } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label={t("header.language")}
          />
        }
      >
        <Languages className="size-5" />
      </DropdownMenuTrigger>
      {/* notranslate: keep language names in their own script, untouched */}
      <DropdownMenuContent align="end" className="w-44 notranslate">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("header.language")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {translateLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className="justify-between"
            >
              {lang.label}
              <Check
                className={cn(
                  "size-4",
                  language === lang.code ? "opacity-100" : "opacity-0"
                )}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
