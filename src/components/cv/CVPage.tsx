import { useState, useEffect, useRef } from 'react';
import type { CVData } from '@/types/cv';
import { useCVPrintPages } from '@/hooks/';
import { CVScreenContent } from './CVScreenContent';
import { CVPrintBlocks } from './CVPrintBlocks';
import cvData from '@/data/cv-data.json';

const PRINT_TITLE = 'Shamil-Ahmed-CV';

export function CVPage() {
  const [data] = useState<CVData>(cvData as CVData);
  const screenLayoutRef = useRef<HTMLDivElement>(null);
  const { printSourceRef, printOutputRef } = useCVPrintPages({
    cvTitle: PRINT_TITLE,
    rebuildSignal: data,
  });

  useEffect(() => {
    const screenLayout = screenLayoutRef.current;
    if (!screenLayout) {
      return;
    }

    // Always start panning from the left edge on initial render.
    screenLayout.scrollLeft = 0;
  }, []);

  return (
    <div className='min-h-screen cv-theme-page py-4 px-4 cv-transition'>
      <div className='cv-screen-layout' ref={screenLayoutRef}>
        <div className='cv-screen-canvas relative'>
          <div className='cv-page mx-auto cv-theme-card shadow-xl cv-transition cv-container'>
            <div className='p-[12mm] print:p-0'>
              <CVScreenContent data={data} />
            </div>
          </div>
        </div>
      </div>

      <div
        ref={printSourceRef}
        className='cv-print-source cv-container'
        aria-hidden='true'>
        <CVPrintBlocks data={data} />
      </div>

      <div
        ref={printOutputRef}
        className='cv-print-output'
        aria-hidden='true'
      />
    </div>
  );
}
