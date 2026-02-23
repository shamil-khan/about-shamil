import { Award as AwardIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { Award } from '@/types/cv';

interface AwardsSectionProps {
  data: Award[];
}

export function AwardsSection({ data }: AwardsSectionProps) {
  return (
    <SectionWrapper id='awards' className='py-16 md:py-24 bg-muted/30'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>Awards & Recognition</SectionTitle>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {data.map((award, index) => (
              <Card
                key={index}
                className='group hover:shadow-md hover:border-primary/50 transition-all'>
                <CardContent className='p-6 flex items-start gap-4'>
                  <div className='p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                    <AwardIcon className='h-5 w-5' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-base leading-tight mb-1'>
                      {award.title}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      {award.issuer}
                    </p>
                    <p className='text-sm text-muted-foreground/70'>
                      {award.year}
                    </p>
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
