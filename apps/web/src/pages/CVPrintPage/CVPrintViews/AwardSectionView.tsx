import { Section } from './Section';
import type { LabelValue2Section } from 'cv-processor';

interface AwardSectionViewProps {
  section: LabelValue2Section;
}

export function AwardSectionView({ section }: AwardSectionViewProps) {
  return (
    <Section key={section.id} title='Honors & Awards'>
      <div className='space-y-1 cv-split-container'>
        {section.labels.map((award, index) => (
          <div
            key={index}
            className='flex justify-between items-baseline text-cv-small cv-split-item'>
            <div className='flex-1 pr-4'>
              <span className='font-semibold cv-theme-heading'>
                {award.label}
              </span>
              <span className='cv-theme-subtext'> - {award.value1}</span>
            </div>
            <span className='cv-theme-muted italic shrink-0'>
              {award.value2}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
