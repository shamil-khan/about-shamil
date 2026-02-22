import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className='mb-4 cv-section'>
      <h3 className='text-cv-section cv-theme-heading tracking-wider pb-0.5 mb-2 flex items-center gap-2 cv-header font-extrabold'>
        <span className='whitespace-nowrap shrink-0'>
          <span className='cv-theme-accent'>{`// ${title.slice(0, 3)}`}</span>
          {title.slice(3)}
        </span>
        <span className='flex-grow border-b-2 cv-theme-border' />
      </h3>
      {children}
    </section>
  );
}
