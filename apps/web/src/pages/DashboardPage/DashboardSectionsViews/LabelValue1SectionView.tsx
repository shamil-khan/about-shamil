import { Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { LabelValue1Section } from 'cv-processor';

interface LabelValue1SectionViewProps {
  section: LabelValue1Section;
}

export function LabelValue1SectionView({
  section,
}: LabelValue1SectionViewProps) {
  const renderLink = (text: string) => {
    // 1. Split string into: [Text before, Full <a> tag, Text after]
    const parts = text.split(/(<a(?:.*?)<\/a>)/g);

    return parts.map((part, i) => {
      if (part.startsWith('<a')) {
        // 2. Extract the URL (href) and the Label (Hello) using simple regex
        const href = part.match(/href="([^"]*)"/)?.[1];
        const label = part.match(/>(.*?)<\/a>/)?.[1];

        return (
          <a
            key={i}
            href={href}
            className='text-blue-500 underline'
            target='_blank'
            rel='noreferrer'>
            {label}
          </a>
        );
      }
      // 3. Return normal text for the rest
      return part;
    });
  };
  return (
    <SectionWrapper id={section.id} className='py-16 md:py-24 app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>{section.title}</SectionTitle>
          <div className='grid gap-4 md:grid-cols-2'>
            {section.labels.map((entry, index) => (
              <Card
                key={`label-${index}`}
                className='app-theme-card-hover app-theme-card-highlight'>
                <CardContent className='p-6 flex items-center gap-4'>
                  <div className='p-3 rounded-full app-theme-icon-soft'>
                    {index === 0 ? (
                      <Clock className='h-5 w-5' />
                    ) : (
                      <Users className='h-5 w-5' />
                    )}
                  </div>
                  <div>
                    <p className='text-sm font-bold app-theme-card-title'>
                      {entry.label}
                    </p>
                    <p className='text-sm app-theme-muted'>
                      {renderLink(entry.value)}
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
