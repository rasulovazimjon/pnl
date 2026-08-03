"use client";

import { useLanguage } from "./LanguageProvider";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, isLocale } from "@/lib/i18n";

// Compact language dropdown. Shows the short code (EN/RU/UZ); options show full
// names. Used in the app header and on the auth pages for consistency.
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t("lang.label")}</span>
      <select
        aria-label={t("lang.label")}
        value={locale}
        onChange={(e) => { if (isLocale(e.target.value)) setLocale(e.target.value); }}
        className="appearance-none cursor-pointer rounded-md border border-[var(--input)] bg-transparent
                   py-1.5 pl-2.5 pr-7 text-sm font-medium text-[var(--foreground)]
                   hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] focus:outline-none focus:border-[var(--ring)]"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>{LOCALE_SHORT[l]} · {LOCALE_NAMES[l]}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 text-[var(--muted-foreground)] text-xs">▾</span>
    </label>
  );
}
