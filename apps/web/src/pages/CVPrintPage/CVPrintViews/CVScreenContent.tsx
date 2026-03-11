import { Section } from './Section';
import {
  type CVDocument,
  type CVSection,
  type EducationSection,
  type ExperienceSection,
  type LabelValue1Section,
  type LabelValue2Section,
  type LabelValuesSection,
  type PersonalSection,
  type SectionType,
  type ValueSection,
} from 'cv-processor';

import {
  AddtionalSectionView,
  AwardSectionView,
  EducationSectionView,
  ExperienceSectionView,
  PersonalSectionView,
  SkillSectionView,
} from '.';

interface CVScreenContentProps {
  cvDocument: CVDocument;
  isPrint: boolean;
}

export function CVScreenContent({
  cvDocument,
  isPrint = false,
}: CVScreenContentProps) {
  const getSection = <T extends CVSection>(type: SectionType): T => {
    const found = cvDocument.sections.find((s) => s.type == type);
    if (!found) {
      throw new Error(`${type} section does not exists.`);
    }
    return found as T;
  };

  return (
    <>
      <div className={isPrint ? 'cv-print-block' : ''}>
        <PersonalSectionView
          section={getSection<PersonalSection>('personal-section')}
        />
      </div>
      <div className={isPrint ? 'cv-print-block' : ''}>
        <Section title='Summary'>
          <p className='text-cv-body cv-theme-body leading-snug text-justify cv-compact'>
            {getSection<ValueSection>('value-section').value}
          </p>
        </Section>
      </div>
      <div className={isPrint ? 'cv-print-block' : ''}>
        <SkillSectionView
          key='skill-section'
          section={getSection<LabelValuesSection>('label-values-section')}
        />
      </div>
      <div className={isPrint ? 'cv-print-block' : ''}>
        <ExperienceSectionView
          section={getSection<ExperienceSection>('experience-section')}
        />
      </div>
      <div className={isPrint ? 'cv-print-block' : ''}>
        <EducationSectionView
          section={getSection<EducationSection>('education-section')}
        />
      </div>
      <div className={isPrint ? 'cv-print-block' : ''}>
        <AwardSectionView
          section={getSection<LabelValue2Section>('label-value2-section')}
        />
      </div>
      <div className={isPrint ? 'cv-print-block' : ''}>
        <AddtionalSectionView
          section={getSection<LabelValue1Section>('label-value1-section')}
        />
      </div>
    </>
  );
}
