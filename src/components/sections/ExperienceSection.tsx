import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { Experience } from '@/types/cv';

interface ExperienceSectionProps {
  data: Experience[];
}

export function ExperienceSection({ data }: ExperienceSectionProps) {
  return (
    <SectionWrapper
      id='experience'
      className='py-16 md:py-24 app-theme-alt-surface app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>Experience</SectionTitle>
          <div className='relative'>
            {/* Timeline Line */}
            <div className='absolute inset-s-0 md:inset-s-8 top-0 bottom-0 w-px app-theme-timeline-line hidden md:block' />

            <div className='space-y-6'>
              {data.map((exp, index) => (
                <div key={index} className='relative md:ps-20'>
                  {/* Timeline Dot */}
                  <div className='absolute inset-s-0 md:inset-s-6 top-6 w-4 h-4 rounded-full border-4 app-theme-timeline-dot hidden md:block' />

                  <Card className='group app-theme-card-hover app-theme-card-highlight'>
                    <CardContent className='p-6'>
                      <div className='flex items-start gap-4'>
                        <div className='p-2 rounded-full app-theme-icon-soft group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                          <Briefcase className='h-5 w-5 shrink-0' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2'>
                            <div>
                              <h3 className='text-lg font-semibold app-theme-card-title'>
                                {exp.position}
                              </h3>
                              <p className='text-base app-theme-muted font-medium'>
                                {exp.company}
                              </p>
                            </div>
                            <div className='flex flex-col sm:items-end gap-1 text-sm app-theme-muted'>
                              <span className='flex items-center gap-1'>
                                <Calendar className='h-3 w-3' />
                                {exp.duration}
                              </span>
                              <span className='flex items-center gap-1'>
                                <MapPin className='h-3 w-3' />
                                {exp.location}
                              </span>
                            </div>
                          </div>

                          <ul className='space-y-2 mt-4'>
                            {exp.highlights.map((highlight, hIndex) => (
                              <li
                                key={hIndex}
                                className='text-sm app-theme-muted flex items-start gap-2'>
                                <span className='w-2 h-2 rounded-full app-theme-experience-bullet shrink-0 mt-1.5' />
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
