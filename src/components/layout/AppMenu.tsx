import { Link } from 'react-router-dom';
import {
  FileText,
  Sun,
  Moon,
  Monitor,
  Languages,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/hooks';
import {
  useLanguageStore,
  selectLanguage,
  selectIsRTL,
  selectLanguages,
} from '@/store';
import { cn } from '@/lib/utils';

const THEME_ICONS = {
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
} as const;

interface AppMenuProps {
  className?: string;
}

export function AppMenu({ className }: AppMenuProps) {
  const { theme, setTheme, themes } = useTheme();

  const language = useLanguageStore(selectLanguage);
  const isRTL = useLanguageStore(selectIsRTL);
  const languages = selectLanguages();
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const CurrentThemeIcon =
    THEME_ICONS[themes.find((t) => t.value === theme)?.icon || 'monitor'];

  return (
    <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className={cn(
            'flex items-center gap-1.5 px-2 hover:bg-accent',
            className,
          )}>
          <Avatar className='h-8 w-8'>
            <AvatarImage src='/logo.png' alt='SK' />
            <AvatarFallback className='bg-primary text-primary-foreground text-sm font-bold'>
              SK
            </AvatarFallback>
          </Avatar>
          <ChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className='w-52'>
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to='/print' className='flex items-center gap-2 cursor-pointer'>
            <FileText className='h-4 w-4' />
            <span>Printable View</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CurrentThemeIcon className='h-4 w-4' />
            <span className='ms-2'>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {themes.map((t) => {
              const Icon = THEME_ICONS[t.icon];
              return (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => setTheme(t.value)}>
                  <Icon className='h-4 w-4' />
                  <span className='ms-2 flex-1'>{t.label}</span>
                  {theme === t.value && <Check className='h-4 w-4' />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className='h-4 w-4' />
            <span className='ms-2'>Language</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}>
                <span className='flex-1'>{lang.nativeLabel}</span>
                {language === lang.code && <Check className='h-4 w-4' />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
