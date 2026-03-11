import { useEffect, useRef } from 'react';
import { useLanguageStore, selectLanguage } from '@/store';
import { useCVData } from '@/hooks';
import { useCVPrintDocument, CVScreenContent } from '.';

const PRINT_TITLE = 'Shamil Ahmed';

export function CVMainView() {
  const language = useLanguageStore(selectLanguage);
  const { cvDocument, isLoading, error } = useCVData({
    locale: language,
  });

  const screenLayoutRef = useRef<HTMLDivElement>(null);
  const { printSourceRef, printOutputRef } = useCVPrintDocument({
    cvTitle: PRINT_TITLE,
    rebuildSignal: cvDocument,
  });

  useEffect(() => {
    const screenLayout = screenLayoutRef.current;
    if (!screenLayout) {
      return;
    }

    // Always start panning from the left edge on initial render.
    screenLayout.scrollLeft = 0;
  }, []);

  if (isLoading) {
    return (
      <div className='min-h-screen app-theme-page app-transition flex items-center justify-center'>
        <div className='animate-pulse app-theme-muted'>Loading...</div>
      </div>
    );
  }

  if (error || !cvDocument) {
    return (
      <div className='min-h-screen app-theme-page app-transition flex items-center justify-center'>
        <div className='text-destructive'>Failed to load CV Document</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen cv-theme-page py-4 px-4 cv-transition'>
      <div className='cv-screen-layout' ref={screenLayoutRef}>
        <div className='cv-screen-canvas relative'>
          <div className='cv-page mx-auto cv-theme-card shadow-xl cv-transition cv-container'>
            <div className='p-[12mm] print:p-0'>
              <CVScreenContent cvDocument={cvDocument!} isPrint={false} />
            </div>
          </div>
        </div>
      </div>

      <div
        ref={printSourceRef}
        className='cv-print-source cv-container'
        aria-hidden='true'>
        <CVScreenContent cvDocument={cvDocument!} isPrint={true} />
      </div>

      <div
        ref={printOutputRef}
        className='cv-print-output'
        aria-hidden='true'
      />
    </div>
  );
}
