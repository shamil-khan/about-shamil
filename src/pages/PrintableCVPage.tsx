import { Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CV } from '@/components/cv/CV';

export function PrintableCVPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Action Bar - Hidden when printing */}
      <div className='fixed top-0 inset-s-0 inset-e-0 z-50 bg-background/95 backdrop-blur border-b print:hidden'>
        <div className='container mx-auto px-4 h-14 flex items-center justify-between'>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/'>
              <ArrowLeft className='h-4 w-4 me-2' />
              Back to CV
            </Link>
          </Button>
          <Button size='sm' onClick={handlePrint}>
            <Printer className='h-4 w-4 me-2' />
            Print
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div className='pt-14 print:pt-0'>
        <CV />
      </div>
    </div>
  );
}
