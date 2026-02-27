import type { CVData } from '@/types/cv';
import { Header } from './Header';
import { Section } from './Section';
import { ExperienceItem } from './ExperienceItem';
import { EducationItem } from './EducationItem';
import { SkillCategory } from './SkillCategory';
import { AwardItem } from './AwardItem';

interface CVPrintBlocksProps {
  data: CVData;
}

export function CVPrintBlocks({ data }: CVPrintBlocksProps) {
  return (
    <>
      <div className='cv-print-block'>
        <Header header={data.header} />
      </div>

      <div className='cv-print-block'>
        <Section title='Summary'>
          <p className='text-cv-body cv-theme-body leading-snug text-justify cv-compact'>
            {data.summary}
          </p>
        </Section>
      </div>

      <div className='cv-print-block'>
        <Section title='Skills'>
          <div className='space-y-1.5'>
            {data.skills.map((skill, index) => (
              <SkillCategory key={`print-skill-${index}`} skill={skill} />
            ))}
          </div>
        </Section>
      </div>

      <div className='cv-print-block'>
        <Section title='Experience'>{null}</Section>
      </div>
      {data.experience.map((exp, index) => (
        <div key={`print-exp-${index}`} className='cv-print-block mb-3'>
          <ExperienceItem experience={exp} />
        </div>
      ))}

      <div className='cv-print-block'>
        <Section title='Education'>{null}</Section>
      </div>
      {data.education.map((edu, index) => (
        <div key={`print-edu-${index}`} className='cv-print-block mb-2.5'>
          <EducationItem education={edu} />
        </div>
      ))}

      <div className='cv-print-block'>
        <Section title='Honors & Awards'>{null}</Section>
      </div>
      {data.awards.map((award, index) => (
        <div key={`print-award-${index}`} className='cv-print-block mb-1'>
          <AwardItem award={award} />
        </div>
      ))}

      <div className='cv-print-block'>
        <Section title='Additional Information'>
          <div className='text-cv-small cv-theme-body space-y-0.5 text-left'>
            <p>
              <span className='font-semibold cv-theme-heading'>
                Availability:
              </span>{' '}
              {data.additional.availability}
            </p>
            <p>
              <span className='font-semibold cv-theme-heading'>
                References:
              </span>{' '}
              {data.additional.references}
            </p>
          </div>
        </Section>
      </div>
    </>
  );
}
