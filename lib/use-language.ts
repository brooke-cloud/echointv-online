"use client";

import { useCallback, useEffect, useState } from "react";

export type SiteLanguage = "en" | "zh";

const STORAGE_KEY = "echointv-language";
const LANGUAGE_EVENT = "echointv-language-change";

export function useLanguage() {
  const [language, setLanguageState] = useState<SiteLanguage>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "zh") setLanguageState(saved);

    const handleLanguageChange = (event: Event) => {
      const nextLanguage = (event as CustomEvent<SiteLanguage>).detail;
      if (nextLanguage === "en" || nextLanguage === "zh") {
        setLanguageState(nextLanguage);
      }
    };

    window.addEventListener(LANGUAGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(LANGUAGE_EVENT, handleLanguageChange);
  }, []);

  const setLanguage = useCallback((nextLanguage: SiteLanguage) => {
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage === "en" ? "en" : "zh-CN";
    setLanguageState(nextLanguage);
    window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: nextLanguage }));
  }, []);

  return { language, setLanguage };
}
