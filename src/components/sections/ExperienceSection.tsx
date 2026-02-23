import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { Experience } from '@/types/cv';

interface ExperienceSectionProps {
  data: Experience[];
}

export function ExperienceSection({ data }: ExperienceSectionProps) {
  return (
    <SectionWrapper id='experience' className='py-16 md:py-24 bg-muted/30'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>Experience</SectionTitle>
          <div className='relative'>
            {/* Timeline Line */}
            <div className='absolute inset-s-0 md:inset-s-8 top-0 bottom-0 w-px bg-border hidden md:block' />

            <div className='space-y-6'>
              {data.map((exp, index) => (
                <div key={index} className='relative md:ps-20'>
                  {/* Timeline Dot */}
                  <div className='absolute inset-s-0 md:inset-s-6 top-6 w-4 h-4 rounded-full bg-primary border-4 border-background hidden md:block' />

                  <Card className='hover:shadow-md transition-shadow'>
                    <CardHeader className='pb-3'>
                      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2'>
                        <div>
                          <h3 className='text-lg font-semibold flex items-center gap-2'>
                            <Briefcase className='h-4 w-4 text-primary shrink-0' />
                            {exp.position}
                          </h3>
                          <p className='text-base text-muted-foreground font-medium'>
                            {exp.company}
                          </p>
                        </div>
                        <div className='flex flex-col sm:items-end gap-1 text-sm text-muted-foreground'>
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
                    </CardHeader>
                    <CardContent>
                      <ul className='space-y-2'>
                        {exp.highlights.map((highlight, hIndex) => (
                          <li
                            key={hIndex}
                            className='text-sm text-muted-foreground flex items-start gap-2'>
                            <span className='w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2' />
                            {highlight}
                          </li>
                        ))}
                      </ul>
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
