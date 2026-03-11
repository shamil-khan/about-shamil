import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { LabelValuesSection } from 'cv-processor';

interface LabelValuesSectionViewProps {
  section: LabelValuesSection;
}

export function LabelValuesSectionView({
  section,
}: LabelValuesSectionViewProps) {
  return (
    <SectionWrapper id={section.id} className='py-16 md:py-24 app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <SectionTitle>{section.title}</SectionTitle>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
            {section.labels.map((item, itemIndex) => (
              <Card
                key={itemIndex}
                className='group app-theme-card-hover app-theme-card-highlight'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg font-semibold app-theme-card-title'>
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {item.values.map((value, valueIndex) => (
                      <Badge
                        key={valueIndex}
                        variant='outline'
                        className='app-theme-skill-badge app-transition'>
                        {value}
                      </Badge>
                    ))}
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
