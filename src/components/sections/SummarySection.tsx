import { Card, CardContent } from '@/components/ui/card';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';

interface SummarySectionProps {
  data: string;
}

export function SummarySection({ data }: SummarySectionProps) {
  return (
    <SectionWrapper id='summary' className='py-16 md:py-24 bg-muted/30'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>About Me</SectionTitle>
          <Card className='border-none shadow-none bg-transparent'>
            <CardContent className='p-0'>
              <p className='text-lg md:text-xl leading-relaxed text-muted-foreground'>
                {data}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionWrapper>
  );
}
