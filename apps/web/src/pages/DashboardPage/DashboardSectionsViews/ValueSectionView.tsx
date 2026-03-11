import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { ValueSection } from 'cv-processor';

interface ValueSectionViewProps {
  section: ValueSection;
}

export function ValueSectionView({ section }: ValueSectionViewProps) {
  return (
    <SectionWrapper
      id={section.id}
      className='py-16 md:py-24 app-theme-alt-surface app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>{section.title}</SectionTitle>
          <p className='text-lg md:text-xl leading-relaxed app-theme-muted'>
            {section.value}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
