export type LanguageCode =
  | 'en'
  | 'ur'
  | 'ar'
  | 'fr'
  | 'de'
  | 'nl'
  | 'es'
  | 'it'
  | 'ja'
  | 'pt';

export type Direction = 'ltr' | 'rtl';

export interface Language {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  dir: Direction;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', dir: 'rtl' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', dir: 'ltr' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', dir: 'ltr' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', dir: 'ltr' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', dir: 'ltr' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', dir: 'ltr' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find((lang) => lang.code === code);
}

export function isRTLLanguage(code: string): boolean {
  const lang = getLanguageByCode(code);
  return lang?.dir === 'rtl';
}
