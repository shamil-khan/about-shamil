import type { Skill } from '@/types/cv';

interface SkillCategoryProps {
  skill: Skill;
}

export function SkillCategory({ skill }: SkillCategoryProps) {
  return (
    <div className='flex flex-wrap items-baseline gap-x-2 text-cv-small'>
      <span className='font-bold cv-theme-heading text-right min-w-[140px] shrink-0'>
        {skill.category}:
      </span>
      <span className='cv-theme-body'>{skill.items.join(', ')}</span>
    </div>
  );
}
