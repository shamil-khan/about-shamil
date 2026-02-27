import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollDirection } from '@/hooks';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const { isScrolled } = useScrollDirection();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button
      variant='outline'
      size='icon'
      className={cn(
        'fixed bottom-6 inset-e-6 z-40 rounded-full shadow-lg app-theme-scroll-top app-transition',
        'transition-all duration-300',
        isScrolled
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none',
      )}
      onClick={scrollToTop}
      aria-label='Scroll to top'>
      <ArrowUp className='h-4 w-4' />
    </Button>
  );
}
