import { useState, useEffect, useRef } from 'react';
import { Printer } from 'lucide-react';
import type { CVData } from '@/types/cv';
import { ThemeToggle } from './ThemeToggle';
import { CVScreenContent } from './CVScreenContent';
import { CVPrintBlocks } from './CVPrintBlocks';
import { useCvPrintPages } from './useCvPrintPages';
import cvData from '@/data/cv-data.json';

const PRINT_TITLE = 'Shamil-Ahmed-CV';

export function CV() {
  const [data] = useState<CVData>(cvData as CVData);
  const [isDark, setIsDark] = useState(false);
  const screenLayoutRef = useRef<HTMLDivElement>(null);
  const { printSourceRef, printOutputRef, handlePrint } = useCvPrintPages({
    cvTitle: PRINT_TITLE,
    rebuildSignal: data,
  });

  useEffect(() => {
    const load = () => {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }
    };
    load();
  }, []);

  useEffect(() => {
    const screenLayout = screenLayoutRef.current;
    if (!screenLayout) {
      return;
    }

    // Always start panning from the left edge on initial render.
    screenLayout.scrollLeft = 0;
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className='min-h-screen cv-theme-page py-4 px-4 cv-transition'>
      <div className='cv-screen-layout' ref={screenLayoutRef}>
        <div className='cv-screen-canvas relative'>
          <div className='cv-action-dock print:hidden'>
            <button
              type='button'
              onClick={handlePrint}
              className='p-1.5 rounded-md cv-theme-toggle shadow-md cv-transition'
              aria-label='Print CV'
              title='Print CV'>
              <Printer className='w-4 h-4 cv-theme-subtext' />
            </button>
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          </div>

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
