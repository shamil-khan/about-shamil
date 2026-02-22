import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export function ThemeToggle({ isDark, toggle }: ThemeToggleProps) {
  return (
    <button
      onClick={toggle}
      type='button'
      className='p-1.5 rounded-md cv-theme-toggle shadow-md cv-transition'
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDark ? (
        <Sun className='w-4 h-4 text-amber-400' />
      ) : (
        <Moon className='w-4 h-4 cv-theme-subtext' />
      )}
    </button>
  );
}
