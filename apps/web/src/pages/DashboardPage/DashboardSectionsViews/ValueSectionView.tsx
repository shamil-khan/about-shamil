import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { ValueSection } from 'cv-processor';

interface ValueSectionViewProps {
  section: ValueSection;
}

export function ValueSectionView({ section }: ValueSectionViewProps) {
  const lines = section.value.split('/n');

  return (
    <SectionWrapper
      id={section.id}
      className='py-16 md:py-24 app-theme-alt-surface app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>{section.title}</SectionTitle>
          {lines.length > 0 &&
            lines.map((line, index) => (
              <p
                key={index}
                className='text-lg md:text-xl leading-relaxed text-justify app-theme-muted'>
                {line}
              </p>
            ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
