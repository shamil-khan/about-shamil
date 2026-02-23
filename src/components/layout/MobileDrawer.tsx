import { Link } from 'react-router-dom';
import {
  FileText,
  Sun,
  Moon,
  Monitor,
  Languages,
  Check,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguageStore, selectLanguage, selectLanguages } from '@/store';
import {
  useThemeStore,
  selectTheme,
  selectSetTheme,
  selectThemes,
} from '@/store';
import type { AppNavItem } from './AppNavItem';
import { cn } from '@/lib/utils';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: AppNavItem[];
  activeSection: string;
  onNavClick: (sectionId: string) => void;
  side: 'left' | 'right';
}

const THEME_ICONS = {
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
} as const;

export function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  activeSection,
  onNavClick,
  side,
}: MobileDrawerProps) {
  const theme = useThemeStore(selectTheme);
  const setTheme = useThemeStore(selectSetTheme);
  const themes = selectThemes();

  const language = useLanguageStore(selectLanguage);
  const languages = selectLanguages();
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const handleNavClick = (sectionId: string) => {
    onNavClick(sectionId);
    onClose();
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(code as Parameters<typeof setLanguage>[0]);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        key={side}
        side={side}
        className='w-75 sm:w-87.5 flex flex-col [&>button:first-of-type]:hidden'>
        {/* Custom RTL-aware close button */}
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='absolute top-4 inset-e-4 h-8 w-8 rounded-sm opacity-70 hover:opacity-100'>
          <X className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </Button>

        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <Separator className='my-4' />

        <nav className='flex flex-col gap-1'>
          <SectionLabel>Navigation</SectionLabel>
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              isActive={activeSection === item.id}
              onClick={() => handleNavClick(item.id)}>
              {item.label}
            </NavButton>
          ))}
        </nav>

        <Separator className='my-4' />

        <div className='flex flex-col gap-1'>
          <SectionLabel>Actions</SectionLabel>
          <Button
            variant='ghost'
            className='justify-start px-3 py-3 h-auto font-medium text-muted-foreground'
            asChild
            onClick={onClose}>
            <Link to='/print'>
              <FileText className='h-4 w-4 me-3' />
              Printable View
            </Link>
          </Button>
        </div>

        <Separator className='my-4' />

        <div className='flex flex-col gap-1'>
          <SectionLabel>Theme</SectionLabel>
          {themes.map((t) => {
            const Icon = THEME_ICONS[t.icon];
            return (
              <OptionButton
                key={t.value}
                isSelected={theme === t.value}
                onClick={() => setTheme(t.value)}
                icon={<Icon className='h-4 w-4' />}>
                {t.label}
              </OptionButton>
            );
          })}
        </div>

        <Separator className='my-4' />

        <div className='flex flex-col gap-1'>
          <SectionLabel>Language</SectionLabel>
          {languages.map((lang) => (
            <OptionButton
              key={lang.code}
              isSelected={language === lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              icon={<Languages className='h-4 w-4' />}>
              {lang.nativeLabel}
            </OptionButton>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className='text-xs font-medium text-muted-foreground px-3 mb-2 uppercase tracking-wide'>
      {children}
    </p>
  );
}

function NavButton({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors text-start',
        'hover:bg-accent hover:text-accent-foreground',
        isActive ? 'text-primary bg-accent' : 'text-muted-foreground',
      )}>
      {children}
    </button>
  );
}

function OptionButton({
  children,
  isSelected,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors text-start',
        'hover:bg-accent hover:text-accent-foreground',
        isSelected ? 'text-primary bg-accent' : 'text-muted-foreground',
      )}>
      <div className='flex items-center gap-3'>
        {icon}
        <span>{children}</span>
      </div>
      {isSelected && <Check className='h-4 w-4' />}
    </button>
  );
}
