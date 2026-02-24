import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppMenu } from './AppMenu';
import { MobileDrawer } from './MobileDrawer';
import { useScrollDirection } from '@/hooks';
import { useLanguageStore, selectIsRTL } from '@/store';
import type { AppNavItem } from './AppNavItem';
import { cn } from '@/lib/utils';

interface AppNavbarProps {
  navItems: AppNavItem[];
  activeSection: string;
  onNavClick: (sectionId: string) => void;
}

export function AppNavbar({
  navItems,
  activeSection,
  onNavClick,
}: AppNavbarProps) {
  const { isScrolled } = useScrollDirection();
  const isRTL = useLanguageStore(selectIsRTL);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    onNavClick(sectionId);
    setIsDrawerOpen(false);
  };

  const drawerSide: 'left' | 'right' = isRTL ? 'right' : 'left';

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'app-theme-glass backdrop-blur-md border-b app-theme-border shadow-sm'
            : 'bg-transparent',
        )}>
        <div className='container mx-auto px-4'>
          <nav className='relative flex items-center justify-center h-16'>
            {/* C2: Hamburger - Mobile Only - Start Side */}
            <div className='absolute top-1/2 -translate-y-1/2 inset-s-4 md:hidden'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsDrawerOpen(true)}
                aria-label='Open navigation menu'>
                <Menu className='h-5 w-5' />
              </Button>
            </div>

            {/* C3: App Logo - Always Visible - End Side */}
            <div className='absolute top-1/2 -translate-y-1/2 inset-e-4'>
              <AppMenu />
            </div>

            {/* C1: NavBar - Desktop Only - Always Centered */}
            <ul className='hidden md:flex items-center gap-1'>
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors app-theme-nav-button',
                      activeSection === item.id
                        ? 'app-theme-nav-active'
                        : 'app-theme-nav-inactive',
                    )}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* C4: Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navItems={navItems}
        activeSection={activeSection}
        onNavClick={handleNavClick}
        side={drawerSide}
      />
    </>
  );
}
