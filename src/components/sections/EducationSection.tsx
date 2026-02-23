import { GraduationCap, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { Education } from '@/types/cv';

interface EducationSectionProps {
  data: Education[];
}

export function EducationSection({ data }: EducationSectionProps) {
  return (
    <SectionWrapper id='education' className='py-16 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>Education</SectionTitle>
          <div className='grid gap-6'>
            {data.map((edu, index) => (
              <Card key={index} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2'>
                    <div>
                      <h3 className='text-lg font-semibold flex items-center gap-2'>
                        <GraduationCap className='h-5 w-5 text-primary shrink-0' />
                        {edu.degree}
                      </h3>
                      <p className='text-base text-muted-foreground'>
                        {edu.institution}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {edu.field}
                      </p>
                    </div>
                    <span className='flex items-center gap-1 text-sm text-muted-foreground'>
                      <Calendar className='h-3 w-3' />
                      {edu.duration}
                    </span>
                  </div>
                </CardHeader>
                {edu.highlights.length > 0 && (
                  <CardContent>
                    <div className='flex flex-wrap gap-2'>
                      {edu.highlights.map((highlight, hIndex) => (
                        <Badge key={hIndex} variant='secondary'>
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
