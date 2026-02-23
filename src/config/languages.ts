export type LanguageCode = 'en' | 'ar' | 'ur' | 'he' | 'fa';

export type Direction = 'ltr' | 'rtl';

export interface Language {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  dir: Direction;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', dir: 'rtl' },
  { code: 'he', label: 'Hebrew', nativeLabel: 'עברית', dir: 'rtl' },
  { code: 'fa', label: 'Persian', nativeLabel: 'فارسی', dir: 'rtl' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find((lang) => lang.code === code);
}

export function isRTLLanguage(code: string): boolean {
  const lang = getLanguageByCode(code);
  return lang?.dir === 'rtl';
}
