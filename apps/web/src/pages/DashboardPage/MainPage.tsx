import { useCallback, useMemo, type JSX } from 'react';
import {
  type EducationSection,
  type ExperienceSection,
  type ISection,
  type LabelValue1Section,
  type LabelValue2Section,
  type LabelValuesSection,
  type PersonalSection,
  type ValueSection,
} from 'cv-processor';
import { useCVData, useActiveSection } from '@/hooks';
import { useLanguageStore, selectLanguage } from '@/store';
import { AppNavbar, type AppNavItem, ScrollToTop } from '@/components/layout';
import {
  PersonalSectionView,
  EducationSectionView,
  ExperienceSectionView,
  ValueSectionView,
  LabelValue1SectionView,
  LabelValue2SectionView,
  LabelValuesSectionView,
  FooterSection,
} from './DashboardSectionsViews';

export function DashboardPage_Main() {
  const language = useLanguageStore(selectLanguage);
  const { cvDocument, isLoading, error } = useCVData({
    locale: language,
  });

  const navItems: AppNavItem[] = useMemo(() => {
    return cvDocument && cvDocument.sections.length > 0
      ? cvDocument?.sections.map(
          (section) =>
            ({
              id: section.id,
              label: section.name,
            }) as AppNavItem,
        )
      : [];
  }, [cvDocument]);

  const sectionIds = useMemo(() => navItems.map((item) => item.id), [navItems]);
  const activeSection = useActiveSection(sectionIds);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleScrollDown = useCallback(() => {
    if (cvDocument && cvDocument.sections.length >= 1) {
      scrollToSection(cvDocument?.sections[1].id);
    }
  }, [scrollToSection, cvDocument]);

  if (isLoading) {
    return (
      <div className='min-h-screen app-theme-page app-transition flex items-center justify-center'>
        <div className='animate-pulse app-theme-muted'>Loading...</div>
      </div>
    );
  }

  if (error || !cvDocument) {
    return (
      <div className='min-h-screen app-theme-page app-transition flex items-center justify-center'>
        <div className='text-destructive'>Failed to load CV Document</div>
      </div>
    );
  }

  const getSectionView = (section: ISection): JSX.Element => {
    let view: JSX.Element = <div key={section.id} />;
    switch (section.type) {
      case 'personal-section':
        view = (
          <PersonalSectionView
            key={section.id}
            section={section as PersonalSection}
            onScrollDown={handleScrollDown}
          />
        );
        break;
      case 'education-section':
        view = (
          <EducationSectionView
            key={section.id}
            section={section as EducationSection}
          />
        );
        break;
      case 'experience-section':
        view = (
          <ExperienceSectionView
            key={section.id}
            section={section as ExperienceSection}
          />
        );
        break;
      case 'value-section':
        view = (
          <ValueSectionView
            key={section.id}
            section={section as ValueSection}
          />
        );
        break;
      case 'label-value1-section':
        view = (
          <LabelValue1SectionView
            key={section.id}
            section={section as LabelValue1Section}
          />
        );
        break;
      case 'label-value2-section':
        view = (
          <LabelValue2SectionView
            key={section.id}
            section={section as LabelValue2Section}
          />
        );
        break;
      case 'label-values-section':
        view = (
          <LabelValuesSectionView
            key={section.id}
            section={section as LabelValuesSection}
          />
        );
        break;
    }
    return view;
  };

  return (
    <div className='min-h-screen app-theme-page app-transition'>
      <AppNavbar
        navItems={navItems}
        activeSection={activeSection}
        onNavClick={scrollToSection}
      />
      <main>
        {cvDocument.sections.map((section) => getSectionView(section))}
        <FooterSection name='Shamil Khan' />
      </main>
      <ScrollToTop />
    </div>
  );
}
