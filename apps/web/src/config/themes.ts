export type Theme = 'light' | 'dark' | 'system';

interface ThemeConfig {
  value: Theme;
  label: string;
  icon: 'sun' | 'moon' | 'monitor';
}

export const DEFAULT_THEME: Theme = 'system';

export const THEMES: ThemeConfig[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
];
