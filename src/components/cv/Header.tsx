import type { Header as HeaderType } from '@/types/cv';
import { Mail, Phone, MapPin, Linkedin, Github, Twitter } from 'lucide-react';

interface HeaderProps {
  header: HeaderType;
}

export function Header({ header }: HeaderProps) {
  const titleTokens = header.titles.join(' \u00B7 ').split(/(\s+)/);

  return (
    <header className='text-center mb-4 cv-header'>
      {/* Name - Large Roboto font */}
      <h1 className='text-cv-name cv-theme-heading mb-1 tracking-tight'>
        {header.name}
      </h1>

      {/* Title - Compact small-caps with emphasized uppercase source characters */}
      <h6 className='cv-theme-accent mb-2.5 leading-tight tracking-[0.05em]'>
        {titleTokens.map((token, index) => {
          if (/^\s+$/.test(token)) {
            return <span key={`ws-${index}`}>{token}</span>;
          }

          return (
            <span key={`title-${index}`} className='inline-flex items-baseline'>
              {Array.from(token).map((char, charIndex) => {
                const isSeparator = char === '\u00B7';
                const isUpperCase =
                  /[A-Z]/.test(char) && char === char.toUpperCase();

                return (
                  <span
                    key={`char-${index}-${charIndex}`}
                    className={
                      isSeparator
                        ? 'text-[1.08rem] font-extrabold tracking-normal px-[0.04em]'
                        : isUpperCase
                          ? 'text-[1.03rem] font-semibold'
                          : 'text-[0.84rem] font-medium tracking-[0.09em]'
                    }>
                    {char.toUpperCase()}
                  </span>
                );
              })}
            </span>
          );
        })}
      </h6>

      {/* Contact Info - Single compact row */}
      <div className='flex flex-nowrap justify-center items-center gap-x-2 whitespace-nowrap text-[0.78rem] leading-none cv-theme-subtext'>
        <ContactItem
          icon={<MapPin size={11} strokeWidth={2.05} />}
          text={header.location}
        />
        <Separator />
        <ContactItem
          icon={<Phone size={11} strokeWidth={2.05} />}
          text={header.phone}
        />
        <Separator />
        <ContactItem
          icon={<Mail size={11} strokeWidth={2.05} />}
          text={header.email}
          isLink={`mailto:${header.email}`}
        />
        <Separator />
        <ContactItem
          icon={
            <Linkedin
              size={14}
              strokeWidth={2.2}
              className='cv-theme-heading'
            />
          }
          text='LinkedIn'
          isLink={`https://${header.linkedin}`}
        />
        <Separator />
        <ContactItem
          icon={
            <Github size={14} strokeWidth={2.2} className='cv-theme-heading' />
          }
          text='GitHub'
          isLink={`https://${header.github}`}
        />
        <Separator />
        <ContactItem
          icon={
            <Twitter size={14} strokeWidth={2.2} className='cv-theme-heading' />
          }
          text={header.twitter}
          isLink={`https://twitter.com/${header.twitter.replace('@', '')}`}
        />
      </div>
    </header>
  );
}

function ContactItem({
  icon,
  text,
  isLink,
}: {
  icon: React.ReactNode;
  text: string;
  isLink?: string;
}) {
  const content = (
    <span className='inline-flex items-center gap-1 cv-theme-link cv-transition'>
      {icon}
      <span>{text}</span>
    </span>
  );

  if (isLink) {
    return (
      <a
        href={isLink}
        target='_blank'
        rel='noopener noreferrer'
        className='no-underline'>
        {content}
      </a>
    );
  }

  return content;
}

function Separator() {
  return <span className='cv-theme-separator text-[0.72rem]'>|</span>;
}
