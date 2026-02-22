import type { CVData } from '@/types/cv';
import { Header } from './Header';
import { Section } from './Section';
import { ExperienceItem } from './ExperienceItem';
import { EducationItem } from './EducationItem';
import { SkillCategory } from './SkillCategory';
import { AwardItem } from './AwardItem';

interface CVScreenContentProps {
  data: CVData;
}

export function CVScreenContent({ data }: CVScreenContentProps) {
  return (
    <>
      <Header header={data.header} />

      <Section title='Summary'>
        <p className='text-cv-body cv-theme-body leading-snug text-justify cv-compact'>
          {data.summary}
        </p>
      </Section>

      <Section title='Skills'>
        <div className='space-y-1.5'>
          {data.skills.map((skill, index) => (
            <SkillCategory key={index} skill={skill} />
          ))}
        </div>
      </Section>

      <Section title='Experience'>
        <div className='space-y-3'>
          {data.experience.map((exp, index) => (
            <ExperienceItem key={index} experience={exp} />
          ))}
        </div>
      </Section>

      <Section title='Education'>
        <div className='space-y-2.5'>
          {data.education.map((edu, index) => (
            <EducationItem key={index} education={edu} />
          ))}
        </div>
      </Section>

      <Section title='Honors & Awards'>
        <div className='space-y-1'>
          {data.awards.map((award, index) => (
            <AwardItem key={index} award={award} />
          ))}
        </div>
      </Section>

      <Section title='Additional Information'>
        <div className='text-cv-small cv-theme-body space-y-0.5 text-left'>
          <p>
            <span className='font-semibold cv-theme-heading'>
              Availability:
            </span>{' '}
            {data.additional.availability}
          </p>
          <p>
            <span className='font-semibold cv-theme-heading'>References:</span>{' '}
            {data.additional.references}
          </p>
        </div>
      </Section>
    </>
  );
}
