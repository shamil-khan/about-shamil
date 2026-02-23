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
    <SectionWrapper id='additional' className='py-16 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>Additional Info</SectionTitle>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card className='hover:shadow-md transition-shadow'>
              <CardContent className='p-6 flex items-center gap-4'>
                <div className='p-3 rounded-full bg-primary/10 text-primary'>
                  <Clock className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Availability</p>
                  <p className='font-semibold'>{data.availability}</p>
                </div>
              </CardContent>
            </Card>
            <Card className='hover:shadow-md transition-shadow'>
              <CardContent className='p-6 flex items-center gap-4'>
                <div className='p-3 rounded-full bg-primary/10 text-primary'>
                  <Users className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>References</p>
                  <p className='font-semibold'>{data.references}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
