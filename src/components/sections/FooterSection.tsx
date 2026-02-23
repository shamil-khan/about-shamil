import { Link } from 'react-router-dom';
import { Heart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterSectionProps {
  name: string;
}

export function FooterSection({ name }: FooterSectionProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='py-8 border-t border-border/50'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <p className='text-sm text-muted-foreground flex items-center gap-1'>
              © {currentYear} {name}. Made with{' '}
              <Heart className='h-3 w-3 text-red-500 fill-red-500' />
            </p>
            <Button variant='outline' size='sm' asChild>
              <Link to='/print'>
                <FileText className='h-4 w-4 me-2' />
                Download Printable CV
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
