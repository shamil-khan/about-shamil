import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Twitter,
  ChevronDown,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionWrapper } from './SectionWrapper';
import type { Header } from '@/types/cv';
import { cn } from '@/lib/utils';

interface HeaderSectionProps {
  data: Header;
  onScrollDown?: () => void;
}

export function HeaderSection({ data, onScrollDown }: HeaderSectionProps) {
  const initials = data.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const socialLinks = [
    { href: data.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { href: data.github, icon: Github, label: 'GitHub' },
    { href: data.twitter, icon: Twitter, label: 'Twitter' },
  ].filter((link) => link.href);

  return (
    <SectionWrapper
      id='header'
      fullHeight
      className='relative bg-linear-to-b from-muted/50 to-background'>
      <div className='container mx-auto px-4 py-16 md:py-24'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Avatar */}
          <Avatar className='w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 ring-4 ring-background shadow-xl'>
            <AvatarImage src={data.photo || '/photo.png'} alt={data.name} />
            <AvatarFallback className='text-3xl md:text-4xl font-semibold bg-primary text-primary-foreground'>
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight'>
            {data.name}
          </h1>

          {/* Titles */}
          <div className='flex flex-wrap justify-center gap-2 mb-6'>
            {data.titles.map((title, index) => (
              <Badge
                key={index}
                variant='secondary'
                className='text-sm md:text-base px-3 py-1'>
                {title}
              </Badge>
            ))}
          </div>

          {/* Location */}
          <div className='flex items-center justify-center gap-2 text-muted-foreground mb-8'>
            <MapPin className='h-4 w-4' />
            <span>{data.location}</span>
          </div>

          {/* Contact Info */}
          <div className='flex flex-wrap justify-center gap-4 mb-8'>
            <a
              href={`mailto:${data.email}`}
              className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors'>
              <Mail className='h-4 w-4' />
              <span className='hidden sm:inline'>{data.email}</span>
              <span className='sm:hidden'>Email</span>
            </a>
            <a
              href={`tel:${data.phone}`}
              className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors'>
              <Phone className='h-4 w-4' />
              <span className='hidden sm:inline'>{data.phone}</span>
              <span className='sm:hidden'>Phone</span>
            </a>
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className='flex justify-center gap-3'>
              {socialLinks.map((link) => (
                <Button
                  key={link.label}
                  variant='outline'
                  size='icon'
                  asChild
                  className='rounded-full'>
                  <a
                    href={`https://${link.href}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={link.label}>
                    <link.icon className='h-4 w-4' />
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
            'animate-bounce text-muted-foreground hover:text-primary transition-colors',
          )}
          aria-label='Scroll to next section'>
          <ChevronDown className='h-8 w-8' />
        </button>
      )}
    </SectionWrapper>
  );
}
