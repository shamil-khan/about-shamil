import { Section } from './Section';
import type { LabelValuesSection } from 'cv-processor';

interface SkillSectionViewProps {
  section: LabelValuesSection;
}

export function SkillSectionView({ section }: SkillSectionViewProps) {
  return (
    <Section key={section.id} title={section.name}>
      <div className='space-y-1.5'>
        {section.labels.map((skill, index) => (
          <div
            key={index}
            className='flex flex-wrap items-baseline gap-x-2 text-cv-small'>
            <span className='font-bold cv-theme-heading text-right min-w-[140px] shrink-0'>
              {skill.label}:
            </span>
            <span className='cv-theme-body'>{skill.values.join(', ')}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
