import { Award as AwardIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { LabelValue2Section } from 'cv-processor';

interface LabelValue2SectionProps {
  section: LabelValue2Section;
}

export function LabelValue2SectionView({ section }: LabelValue2SectionProps) {
  return (
    <SectionWrapper
      id={section.id}
      className='py-16 md:py-24 app-theme-alt-surface app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>{section.title}</SectionTitle>
          <div className='grid gap-4'>
            {section.labels.map((entry, index) => (
              <Card
                key={index}
                className='group app-theme-card-hover app-theme-card-highlight'>
                <CardContent className='p-6 flex items-start gap-4'>
                  <div className='p-2 rounded-full app-theme-icon-soft group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                    <AwardIcon className='h-5 w-5' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-base leading-tight mb-1 app-theme-card-title'>
                      {entry.label}
                    </h3>
                    <p className='text-sm app-theme-muted'>{entry.value1}</p>
                    <p className='text-sm app-theme-muted opacity-75'>
                      {entry.value2}
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
