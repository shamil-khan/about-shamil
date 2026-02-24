import { Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { Additional } from '@/types/cv';

interface AdditionalSectionProps {
  data: Additional;
}

export function AdditionalSection({ data }: AdditionalSectionProps) {
  return (
    <SectionWrapper id='additional' className='py-16 md:py-24 app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>Additional Info</SectionTitle>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card className='app-theme-card-hover app-theme-card-highlight'>
              <CardContent className='p-6 flex items-center gap-4'>
                <div className='p-3 rounded-full app-theme-icon-soft'>
                  <Clock className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-sm app-theme-muted'>Availability</p>
                  <p className='font-semibold app-theme-card-title'>
                    {data.availability}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className='app-theme-card-hover app-theme-card-highlight'>
              <CardContent className='p-6 flex items-center gap-4'>
                <div className='p-3 rounded-full app-theme-icon-soft'>
                  <Users className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-sm app-theme-muted'>References</p>
                  <p className='font-semibold app-theme-card-title'>
                    {data.references}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
