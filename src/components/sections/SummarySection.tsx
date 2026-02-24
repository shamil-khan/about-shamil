import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';

interface SummarySectionProps {
  data: string;
}

export function SummarySection({ data }: SummarySectionProps) {
  return (
    <SectionWrapper
      id='summary'
      className='py-16 md:py-24 app-theme-alt-surface app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <SectionTitle>About Me</SectionTitle>
          <p className='text-lg md:text-xl leading-relaxed app-theme-muted'>
            {data}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
