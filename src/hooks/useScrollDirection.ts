import { useState, useEffect, useRef } from 'react';

export type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionOptions {
  threshold?: number;
  initialDirection?: ScrollDirection;
}

interface UseScrollDirectionReturn {
  scrollDirection: ScrollDirection;
  isScrolled: boolean;
  scrollY: number;
}

export function useScrollDirection(
  options: UseScrollDirectionOptions = {},
): UseScrollDirectionReturn {
  const { threshold = 10, initialDirection = null } = options;

  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection>(initialDirection);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;

      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 100);

      if (Math.abs(currentScrollY - lastScrollY.current) < threshold) {
        ticking.current = false;
        return;
      }

      setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = currentScrollY > 0 ? currentScrollY : 0;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold]);

  return { scrollDirection, isScrolled, scrollY };
}
