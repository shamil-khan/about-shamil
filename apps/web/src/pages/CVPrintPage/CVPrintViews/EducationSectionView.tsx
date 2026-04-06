import { Section } from './Section';
import type { EducationSection } from 'cv-processor';

interface EducationSectionViewProps {
  section: EducationSection;
}

export function EducationSectionView({ section }: EducationSectionViewProps) {
  return (
    <Section key={section.id} title={section.title}>
      <div className='space-y-2.5 cv-split-container'>
        {section.educations.map((education, index) => (
          <div key={index} className='cv-entry cv-split-item'>
            <div className='cv-sub-header'>
              {/* Header Row - Institution left, Duration right */}
              <div className='flex justify-between items-baseline mb-0.5'>
                <h4 className='font-bold text-cv-company cv-theme-heading'>
                  {education.degree}
                </h4>
                <span className='text-cv-small cv-theme-muted italic'>
                  {education.duration.from} - {education.duration.to}
                </span>
              </div>

              {/* Degree Row */}
              <p className='text-cv-position cv-theme-subtext mb-0.5'>
                {education.institution}
                {education.field &&
                  education.field !== 'Computer Science' &&
                  education.field !== 'Mathematics' &&
                  education.field !== 'Management' &&
                  education.field !== 'Partial -- 1 Year Completed' && (
                    <span className='cv-theme-muted'> ({education.field})</span>
                  )}
              </p>
            </div>

            {/* Highlights */}
            {education.highlights && education.highlights.length > 0 && (
              <ul className='list-disc list-outside ml-4 space-y-0 cv-split-subcontainer'>
                {education.highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    className='text-cv-small cv-theme-subtext text-left cv-split-subitem'>
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
