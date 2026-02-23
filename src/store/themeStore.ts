import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Theme, THEMES, DEFAULT_THEME } from '@/config';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  const actualTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  root.classList.add(actualTheme);
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);

export const selectTheme = (state: ThemeState) => state.theme;
export const selectSetTheme = (state: ThemeState) => state.setTheme;
export const selectThemes = () => THEMES;

/**
 * GLOBAL LISTENER
 * Listens for OS-level theme changes.
 * If the app is in 'system' mode, it updates the UI immediately.
 */
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const currentTheme = useThemeStore.getState().theme;
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    });
}
