import { GraduationCap, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { Education } from '@/types/cv';

interface EducationSectionProps {
  data: Education[];
}

export function EducationSection({ data }: EducationSectionProps) {
  return (
    <SectionWrapper id='education' className='py-16 md:py-24 app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>Education</SectionTitle>
          <div className='grid gap-6'>
            {data.map((edu, index) => (
              <Card
                key={index}
                className='group app-theme-card-hover app-theme-card-highlight'>
                <CardContent className='p-6'>
                  <div className='flex items-start gap-4'>
                    <div className='p-2 rounded-full app-theme-icon-soft group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                      <GraduationCap className='h-5 w-5 shrink-0' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2'>
                        <div>
                          <h3 className='text-lg font-semibold app-theme-card-title'>
                            {edu.degree}
                          </h3>
                          <p className='text-base app-theme-muted'>
                            {edu.institution}
                          </p>
                          <p className='text-sm app-theme-muted'>{edu.field}</p>
                        </div>
                        <span className='flex items-center gap-1 text-sm app-theme-muted'>
                          <Calendar className='h-3 w-3' />
                          {edu.duration}
                        </span>
                      </div>

                      {edu.highlights.length > 0 && (
                        <div className='flex flex-wrap gap-2 mt-4'>
                          {edu.highlights.map((highlight, hIndex) => (
                            <Badge key={hIndex} variant='secondary'>
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
