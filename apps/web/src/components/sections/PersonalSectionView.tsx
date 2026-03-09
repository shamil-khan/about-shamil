import { MapPin, Mail, Phone, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionWrapper } from './SectionWrapper';
import { cn } from '@/lib/utils';
import type { PersonalSection, SocialEntry } from 'cv-processor';

class BrandRegistry {
  private static readonly brands: Record<
    string,
    { title: string; path: string }
  > = {
    linkedin: {
      title: 'LinkedIn',
      path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
    },
    github: {
      title: 'GitHub',
      path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
    },
    twitter: {
      title: 'X',
      path: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
    },
    youtube: {
      title: 'YouTube',
      path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    },
  };
  static getInfo(key: string) {
    const data = this.brands[key.toLowerCase()];
    return data || { title: key, path: '' };
  }
}

const BrandIcon = ({
  path,
  className,
}: {
  path: string;
  className?: string;
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
    xmlns='http://w3.org'>
    <path d={path} />
  </svg>
);

// todo cv-process provide this
type SocialLink = {
  name: string;
  title: string;
  url: string;
  icon: string;
};

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

  const socialLinks: SocialLink[] = section.info.social.map(
    (entry: SocialEntry): SocialLink => {
      const [[key, value]] = Object.entries(entry);
      const brand = BrandRegistry.getInfo(key);
      return {
        name: key,
        title: brand.title,
        url: value,
        icon: brand.path,
      };
    },
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
          {socialLinks.length > 0 && (
            <div className='flex justify-center gap-3'>
              {socialLinks.map((link, index) => (
                <Button
                  key={`${link.name}-${index}`}
                  variant='outline'
                  size='icon'
                  asChild
                  className='rounded-full app-theme-social-button app-transition'>
                  <a
                    href={`https://${link.url}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={link.title}>
                    <BrandIcon path={link.icon} className='h-4 w-4' />
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
