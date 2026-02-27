import type { Education } from '@/types/cv';

interface EducationItemProps {
  education: Education;
}

export function EducationItem({ education }: EducationItemProps) {
  const hasHighlights = education.highlights && education.highlights.length > 0;

  return (
    <div className='cv-entry'>
      {/* Header Row - Institution left, Duration right */}
      <div className='flex justify-between items-baseline mb-0.5'>
        <h4 className='font-bold text-cv-company cv-theme-heading'>
          {education.institution}
        </h4>
        <span className='text-cv-small cv-theme-muted italic'>
          {education.duration}
        </span>
      </div>

      {/* Degree Row */}
      <p className='text-cv-position cv-theme-subtext mb-0.5 text-left'>
        {education.degree}
        {education.field &&
          education.field !== 'Computer Science' &&
          education.field !== 'Mathematics' &&
          education.field !== 'Management' &&
          education.field !== 'Partial -- 1 Year Completed' && (
            <span className='cv-theme-muted'> ({education.field})</span>
          )}
      </p>

      {/* Highlights */}
      {hasHighlights && (
        <ul className='list-disc list-outside ml-4 space-y-0'>
          {education.highlights.map((highlight, idx) => (
            <li key={idx} className='text-cv-small cv-theme-subtext text-left'>
              {highlight}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
