import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type LanguageCode,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
  isRTLLanguage,
} from '@/config/languages';

interface LanguageState {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
}

function getInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const browserLang = navigator.language.split('-')[0];
  const lang = getLanguageByCode(browserLang);

  return lang ? (browserLang as LanguageCode) : DEFAULT_LANGUAGE;
}

function updateDocumentDirection(code: LanguageCode): void {
  if (typeof window === 'undefined') return;

  const lang = getLanguageByCode(code);
  if (lang) {
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.dir;
  }
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: getInitialLanguage(),

      setLanguage: (code) => {
        set({ language: code });
        updateDocumentDirection(code);
      },
    }),
    {
      name: 'language',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateDocumentDirection(state.language);
        }
      },
    },
  ),
);

// Selectors
export const selectLanguage = (state: LanguageState) => state.language;
export const selectIsRTL = (state: LanguageState) =>
  isRTLLanguage(state.language);
export const selectLanguages = () => LANGUAGES;
