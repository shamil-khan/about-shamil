import type { Award } from '@/types/cv';

interface AwardItemProps {
  award: Award;
}

export function AwardItem({ award }: AwardItemProps) {
  return (
    <div className='flex justify-between items-baseline text-cv-small'>
      <div className='flex-1 pr-4 text-left'>
        <span className='font-semibold cv-theme-heading'>{award.title}</span>
        <span className='cv-theme-subtext'> - {award.issuer}</span>
      </div>
      <span className='cv-theme-muted italic shrink-0'>{award.year}</span>
    </div>
  );
}
