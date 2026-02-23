import { cn } from '@/lib/utils';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2
      className={cn(
        'text-2xl md:text-3xl font-bold mb-8 relative inline-block',
        'after:content-[""] after:absolute after:bottom-0 after:inset-s-0',
        'after:w-12 after:h-1 after:bg-primary after:rounded-full',
        'pb-3',
        className,
      )}>
      {children}
    </h2>
  );
}
