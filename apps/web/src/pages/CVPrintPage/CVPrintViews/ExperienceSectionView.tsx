import { Section } from './Section';
import type { ExperienceSection } from 'cv-processor';

interface ExperienceSectionViewProps {
  section: ExperienceSection;
}

export function ExperienceSectionView({ section }: ExperienceSectionViewProps) {
  return (
    <Section key={section.id} title={section.title}>
      <div className='space-y-3 cv-print-experience cv-split-container'>
        {section.experiences.map((experience, index) => (
          <div key={index} className='cv-entry cv-split-item'>
            <div className='cv-sub-header'>
              {/* Header Row - Company left, Location/Date right */}
              <div className='flex justify-between items-baseline mb-0.5'>
                <h4 className='font-bold text-cv-company cv-theme-heading'>
                  {experience.position}
                </h4>
                <span className='text-cv-small cv-theme-subtext italic'>
                  {experience.duration.from} - {experience.duration.to}
                </span>
              </div>

              {/* Second Row - Position left, Duration right */}
              <div className='flex justify-between items-baseline mb-1'>
                <p className='text-cv-position cv-theme-subtext uppercase tracking-wide'>
                  {experience.company}
                </p>
                <span className='text-cv-small cv-theme-muted'>
                  {experience.location}
                </span>
              </div>
            </div>

            {/* Highlights - Compact bullets */}
            {experience.highlights && experience.highlights.length > 0 && (
              <ul className='list-disc list-outside pl-4 space-y-0.5 cv-split-subcontainer'>
                {experience.highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    className='text-cv-small text-justify cv-theme-body leading-snug cv-split-subitem'>
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
