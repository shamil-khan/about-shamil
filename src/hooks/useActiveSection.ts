import { useState, useEffect, useCallback } from 'react';

export function useActiveSection(sectionIds: string[]): string {
  const [activeSection, setActiveSection] = useState<string>(
    sectionIds[0] || '',
  );

  const findActiveSection = useCallback(() => {
    if (sectionIds.length === 0) return;

    const scrollPosition = window.scrollY;
    const viewportHeight = window.innerHeight;
    const offset = viewportHeight * 0.3; // 30% from top triggers activation

    let currentSection = sectionIds[0];

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollPosition;
      const elementBottom = elementTop + rect.height;

      // Section is active if its top is above the offset point
      // and its bottom is still below the scroll position
      if (
        elementTop <= scrollPosition + offset &&
        elementBottom > scrollPosition
      ) {
        currentSection = id;
      }
    }

    setActiveSection(currentSection);
  }, [sectionIds]);

  useEffect(() => {
    const load = () => {
      if (sectionIds.length === 0) return;

      // Initial check
      findActiveSection();

      // Throttled scroll handler
      let ticking = false;

      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            findActiveSection();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    };
    void load();
  }, [sectionIds, findActiveSection]);

  return activeSection;
}
