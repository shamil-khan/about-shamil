import { Mail, Phone, MapPin } from 'lucide-react';
import type { PersonalSection } from 'cv-processor';
import {
  BrandIcon,
  toSocialBrand,
  type SocialBrand,
} from '@/components/social-brands';
import { selectLanguage, useLanguageStore } from '@/store';
import { isRTLLanguage } from '@/config';

interface PersonalSectionViewProps {
  section: PersonalSection;
}

export function PersonalSectionView({ section }: PersonalSectionViewProps) {
  const language = useLanguageStore(selectLanguage);
  const isRTL = isRTLLanguage(language);
  const titleTokens = section.info.titles.join(' \u00B7 ').split(/(\s+)/);
  const socialBrands: SocialBrand[] = section.info.social.map((entry) =>
    toSocialBrand(entry),
  );

  return (
    <header className='text-center mb-4 cv-header'>
      {/* Name - Large Roboto font */}
      <h1 className='font-bold text-3xl cv-theme-heading mb-1 tracking-tight'>
        {section.info.name}
      </h1>

      {isRTL ? (
        <h6 className='cv-theme-accent mb-2.5 leading-tight tracking-[0.05em]'>
          {section.info.titles.map((title, index) => (
            <>
              <span className='inline-flex items-baseline'>{title}</span>
              {index < section.info.titles.length - 1 ? (
                <span
                  key={`title-${index}`}
                  className='text-[1.08rem] font-extrabold tracking-normal px-[0.04em]'>
                  {' \u00B7 '}
                </span>
              ) : (
                ''
              )}
            </>
          ))}
        </h6>
      ) : (
        <h6 className='cv-theme-accent mb-2.5 leading-tight tracking-[0.05em]'>
          {titleTokens.map((token, index) => {
            if (/^\s+$/.test(token)) {
              return <span key={`ws-${index}`}>{token}</span>;
            }

            return (
              <span
                key={`title-${index}`}
                className='inline-flex items-baseline'>
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
      )}

      {/* Contact Info - Single compact row */}
      <div className='flex flex-nowrap justify-center items-center gap-x-2 whitespace-nowrap text-[0.78rem] leading-none cv-theme-subtext'>
        <ContactItem
          icon={<MapPin size={11} strokeWidth={2.05} />}
          text={section.info.location}
        />
        <Separator />

        <ContactItem
          icon={<Phone size={11} strokeWidth={2.05} />}
          text={section.info.phone}
        />
        <Separator />

        <span className='cv-theme-separator text-[0.72rem]'>|</span>
        <ContactItem
          icon={<Mail size={11} strokeWidth={2.05} />}
          text={section.info.email}
          isLink={`mailto:${section.info.email}`}
        />
        <Separator />

        {socialBrands.length > 0 &&
          socialBrands.map((brand, index) => (
            <>
              <ContactItem
                key={index}
                icon={
                  <BrandIcon
                    path={brand.icon}
                    className='cv-theme-heading'
                    height={14}
                    width={14}
                    strokeWidth={2.2}
                  />
                }
                text={brand.title}
                isLink={brand.url}
              />
              <Separator />
            </>
          ))}
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
