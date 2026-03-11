import { Section } from './Section';
import type { LabelValue1Section } from 'cv-processor';

interface AddtionalSectionViewProps {
  section: LabelValue1Section;
}

export function AddtionalSectionView({ section }: AddtionalSectionViewProps) {
  return (
    <Section key={section.id} title={section.title}>
      <div className='text-cv-small cv-theme-body space-y-0.5'>
        {section.labels.map((item, index) => (
          <p key={index}>
            <span className='font-semibold cv-theme-heading'>{item.label}</span>{' '}
            {item.value}
          </p>
        ))}
      </div>
    </Section>
  );
}
