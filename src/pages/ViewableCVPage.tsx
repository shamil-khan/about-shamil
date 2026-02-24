import { useCallback, useMemo } from 'react';
import { AppNavbar, type AppNavItem, ScrollToTop } from '@/components/layout';
import {
  HeaderSection,
  SummarySection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  AwardsSection,
  AdditionalSection,
  FooterSection,
} from '@/components/sections';
import { useCVData, useActiveSection } from '@/hooks';
import { useLanguageStore, selectLanguage } from '@/store';

export function ViewableCVPage() {
  const language = useLanguageStore(selectLanguage);
  const { data, isLoading, error } = useCVData({ locale: language });

  const navItems: AppNavItem[] = useMemo(
    () => [
      { id: 'header', label: 'Home' },
      { id: 'summary', label: 'About' },
      { id: 'skills', label: 'Skills' },
      { id: 'experience', label: 'Experience' },
      { id: 'education', label: 'Education' },
      { id: 'awards', label: 'Awards' },
      { id: 'additional', label: 'Info' },
    ],
    [],
  );

  const sectionIds = useMemo(() => navItems.map((item) => item.id), [navItems]);
  const activeSection = useActiveSection(sectionIds);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleScrollDown = useCallback(() => {
    scrollToSection('summary');
  }, [scrollToSection]);

  if (isLoading) {
    return (
      <div className='min-h-screen app-theme-page app-transition flex items-center justify-center'>
        <div className='animate-pulse app-theme-muted'>Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className='min-h-screen app-theme-page app-transition flex items-center justify-center'>
        <div className='text-destructive'>Failed to load CV data</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen app-theme-page app-transition'>
      <AppNavbar
        navItems={navItems}
        activeSection={activeSection}
        onNavClick={scrollToSection}
      />

      <main>
        <HeaderSection data={data.header} onScrollDown={handleScrollDown} />
        <SummarySection data={data.summary} />
        <SkillsSection data={data.skills} />
        <ExperienceSection data={data.experience} />
        <EducationSection data={data.education} />
        <AwardsSection data={data.awards} />
        <AdditionalSection data={data.additional} />
        <FooterSection name={data.header.name} />
      </main>

      <ScrollToTop />
    </div>
  );
}
