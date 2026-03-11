import { MapPin, Mail, Phone, ChevronDown } from 'lucide-react';
import type { PersonalSection, SocialEntry } from 'cv-processor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BrandIcon,
  toSocialBrand,
  type SocialBrand,
} from '@/components/social-brands';
import { cn } from '@/lib/utils';
import { SectionWrapper } from './SectionWrapper';

interface PersonalSectionViewProps {
  section: PersonalSection;
  onScrollDown?: () => void;
}

export function PersonalSectionView({
  section,
  onScrollDown,
}: PersonalSectionViewProps) {
  const initials = section.info.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const socialBrands: SocialBrand[] = section.info.social.map(
    (entry: SocialEntry) => toSocialBrand(entry),
  );

  return (
    <SectionWrapper
      id={section.id}
      fullHeight
      className='relative app-theme-hero app-transition'>
      <div className='container mx-auto px-4 py-16 md:py-24'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Avatar */}
          <Avatar className='w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 ring-4 ring-background shadow-xl transition-transform duration-300 hover:scale-105'>
            <AvatarImage
              src={section.info.photo || '/photo.png'}
              alt={section.info.name}
            />
            <AvatarFallback className='text-3xl md:text-4xl font-semibold app-theme-avatar-fallback app-transition'>
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight app-theme-heading'>
            {section.info.name}
          </h1>

          {/* Titles */}
          <div className='flex flex-wrap justify-center gap-2 mb-6'>
            {section.info.titles.map((title, index) => (
              <Badge
                key={index}
                variant='secondary'
                className='text-sm md:text-base px-3 py-1 app-theme-title-badge app-theme-hero-badge app-transition'>
                {title}
              </Badge>
            ))}
          </div>

          {/* Location */}
          <div className='flex items-center justify-center gap-2 app-theme-muted mb-8'>
            <MapPin className='h-4 w-4' />
            <span>{section.info.location}</span>
          </div>

          {/* Contact Info */}
          <div className='flex flex-wrap justify-center gap-4 mb-8'>
            <a
              href={`mailto:${section.info.email}`}
              className='flex items-center gap-2 text-sm app-theme-muted app-theme-link'>
              <Mail className='h-4 w-4' />
              <span className='hidden sm:inline'>{section.info.email}</span>
              <span className='sm:hidden'>Email</span>
            </a>
            <a
              href={`tel:${section.info.phone}`}
              className='flex items-center gap-2 text-sm app-theme-muted app-theme-link'>
              <Phone className='h-4 w-4' />
              <span className='hidden sm:inline'>{section.info.phone}</span>
              <span className='sm:hidden'>Phone</span>
            </a>
          </div>

          {/* Social Links */}
          {socialBrands.length > 0 && (
            <div className='flex justify-center gap-3'>
              {socialBrands.map((brand, index) => (
                <Button
                  key={`${brand.name}-${index}`}
                  variant='outline'
                  size='icon'
                  asChild
                  className='rounded-full app-theme-social-button app-transition'>
                  <a
                    href={`https://${brand.url}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={brand.title}>
                    <BrandIcon path={brand.icon} className='h-4 w-4' />
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      {onScrollDown && (
        <button
          onClick={onScrollDown}
          className={cn(
            'absolute bottom-8 inset-s-1/2 -translate-x-1/2',
            'animate-bounce app-theme-muted app-theme-link',
          )}
          aria-label='Scroll to next section'>
          <ChevronDown className='h-8 w-8' />
        </button>
      )}
    </SectionWrapper>
  );
}
