import type { Experience } from '@/types/cv';

interface ExperienceItemProps {
  experience: Experience;
}

export function ExperienceItem({ experience }: ExperienceItemProps) {
  const hasHighlights =
    experience.highlights && experience.highlights.length > 0;

  return (
    <div className='cv-entry'>
      {/* Header Row - Company left, Location/Date right */}
      <div className='flex justify-between items-baseline mb-0.5'>
        <h4 className='font-bold text-cv-company cv-theme-heading'>
          {experience.company}
        </h4>
        <span className='text-cv-small cv-theme-subtext italic'>
          {experience.location}
        </span>
      </div>

      {/* Second Row - Position left, Duration right */}
      <div className='flex justify-between items-baseline mb-1'>
        <p className='text-cv-position cv-theme-subtext uppercase tracking-wide'>
          {experience.position}
        </p>
        <span className='text-cv-small cv-theme-muted'>
          {experience.duration}
        </span>
      </div>

      {/* Highlights - Compact bullets */}
      {hasHighlights && (
        <ul className='list-disc list-outside pl-4 space-y-0.5'>
          {experience.highlights.map((highlight, idx) => (
            <li
              key={idx}
              className='text-cv-small cv-theme-body leading-snug text-left'>
              {highlight}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
