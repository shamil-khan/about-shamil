import { Heart } from 'lucide-react';

interface FooterSectionProps {
  name: string;
}

export function FooterSection({ name }: FooterSectionProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='py-8 border-t app-theme-border app-transition'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <p className='text-sm app-theme-muted flex items-center gap-1'>
              &copy; {currentYear} {name}. Made with{' '}
              <Heart className='h-3 w-3 app-theme-accent fill-current' />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
