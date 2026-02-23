import { useEffect, useState, useCallback } from 'react';
import {
  type LanguageCode,
  type Language,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
  isRTLLanguage,
} from '@/config/languages';

const STORAGE_KEY = 'language';

function getInitialLanguage(): LanguageCode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && getLanguageByCode(stored)) {
    return stored as LanguageCode;
  }

  const browserLang = navigator.language.split('-')[0];
  if (getLanguageByCode(browserLang)) {
    return browserLang as LanguageCode;
  }

  return DEFAULT_LANGUAGE;
}

export function useLanguage() {
  const [language, setLanguageState] =
    useState<LanguageCode>(getInitialLanguage);

  const currentLanguage = getLanguageByCode(language) as Language;
  const isRTL = isRTLLanguage(language);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const lang = getLanguageByCode(language);

    if (lang) {
      root.setAttribute('lang', lang.code);
      root.setAttribute('dir', lang.dir);
    }
  }, [language]);

  return {
    language, // ← Make sure this is returned
    setLanguage,
    currentLanguage,
    isRTL,
    languages: LANGUAGES,
  };
}
