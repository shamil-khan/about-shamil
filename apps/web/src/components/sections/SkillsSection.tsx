import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionWrapper } from './SectionWrapper';
import { SectionTitle } from './SectionTitle';
import type { Skill } from '@/types/cv';

interface SkillsSectionProps {
  data: Skill[];
}

export function SkillsSection({ data }: SkillsSectionProps) {
  return (
    <SectionWrapper id='skills' className='py-16 md:py-24 app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <SectionTitle>Skills</SectionTitle>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
            {data.map((skill, index) => (
              <Card
                key={index}
                className='group app-theme-card-hover app-theme-card-highlight'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg font-semibold app-theme-card-title'>
                    {skill.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {skill.items.map((item, itemIndex) => (
                      <Badge
                        key={itemIndex}
                        variant='outline'
                        className='app-theme-skill-badge app-transition'>
                        {item}
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
