import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  fullHeight?: boolean;
}

export const SectionWrapper = forwardRef<HTMLElement, SectionWrapperProps>(
  ({ id, className, children, fullHeight = false }, ref) => {
    return (
      <section
        id={id}
        ref={ref}
        className={cn(
          'scroll-mt-20',
          fullHeight && 'min-h-screen flex flex-col justify-center',
          className,
        )}>
        {children}
      </section>
    );
  },
);

SectionWrapper.displayName = 'SectionWrapper';
