"use client";

import { createContext, useContext, useCallback, useMemo, useState } from "react";
import {
  Locale,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  translate,
  monthLabelIntl,
  monthShort,
} from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  monthLabel: (key: string) => string;
  monthShort: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    // Persist for one year so SSR renders the right language with no flash.
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
      monthLabel: (key) => monthLabelIntl(locale, key),
      monthShort: (key) => monthShort(locale, key),
    }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback so components never crash outside a provider (e.g. tests).
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key, params) => translate(DEFAULT_LOCALE, key, params),
      monthLabel: (key) => monthLabelIntl(DEFAULT_LOCALE, key),
      monthShort: (key) => monthShort(DEFAULT_LOCALE, key),
    };
  }
  return ctx;
}

/** Convenience hook when you only need the translate function. */
export function useT() {
  return useLanguage().t;
}
