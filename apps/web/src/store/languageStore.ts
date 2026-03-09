import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type LanguageCode,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
  isRTLLanguage,
} from '@/config';

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

function applyLanguageToDocument(code: LanguageCode): void {
  if (typeof window === 'undefined') return;

  const lang = getLanguageByCode(code);
  if (!lang) return;

  const root = document.documentElement;
  root.setAttribute('lang', lang.code);
  root.setAttribute('dir', lang.dir);
}

// Apply initial language to document immediately
applyLanguageToDocument(getInitialLanguage());

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: getInitialLanguage(),

      setLanguage: (code) => {
        const lang = getLanguageByCode(code);
        if (!lang) return;

        applyLanguageToDocument(code);
        set({ language: code });
      },
    }),
    {
      name: 'language',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          applyLanguageToDocument(state.language);
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
