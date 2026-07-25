"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getT, parseLang, type Lang } from "@/lib/i18n";

interface LanguageContextType {
  lang: Lang;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aoi_lang");
      const cookie = document.cookie
        .split("; ")
        .find((c) => c.startsWith("aoi_lang="))
        ?.split("=")[1];
      const initial = parseLang(saved || cookie);
      setLangState(initial);
      document.documentElement.lang = initial;
    } catch {
      // fallback to fr
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem("aoi_lang", next);
      document.cookie = `aoi_lang=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
      document.documentElement.lang = next;
    } catch {}
    // Full reload so server components re-render with the new language cookie
    window.location.reload();
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: getT(lang), setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return { lang: "fr" as Lang, t: getT("fr"), setLang: () => {} };
  }
  return ctx;
}
