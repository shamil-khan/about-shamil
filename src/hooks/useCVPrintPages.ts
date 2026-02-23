import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';

export interface UseCVPrintPagesOptions {
  cvTitle: string;
  rebuildSignal?: unknown;
}

export interface UseCVPrintPagesResult {
  printSourceRef: RefObject<HTMLDivElement | null>;
  printOutputRef: RefObject<HTMLDivElement | null>;
}

export function useCVPrintPages({
  cvTitle,
  rebuildSignal,
}: UseCVPrintPagesOptions): UseCVPrintPagesResult {
  const printSourceRef = useRef<HTMLDivElement>(null);
  const printOutputRef = useRef<HTMLDivElement>(null);
  const printDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const buildPrintPages = useCallback(() => {
    const source = printSourceRef.current;
    const output = printOutputRef.current;

    if (!source || !output) {
      return;
    }

    const blocks = Array.from(
      source.querySelectorAll(':scope > .cv-print-block'),
    ) as HTMLElement[];

    output.innerHTML = '';

    if (blocks.length === 0) {
      return;
    }

    const createSheet = () => {
      const sheet = document.createElement('section');
      sheet.className = 'cv-print-sheet cv-container';

      const header = document.createElement('header');
      header.className = 'cv-print-sheet-header';

      const title = document.createElement('span');
      title.className = 'cv-print-sheet-title';
      title.textContent = cvTitle;

      const date = document.createElement('span');
      date.className = 'cv-print-sheet-date';
      date.textContent = `Date: ${printDate}`;

      header.appendChild(title);
      header.appendChild(date);

      const content = document.createElement('div');
      content.className = 'cv-print-sheet-content';

      const footer = document.createElement('footer');
      footer.className = 'cv-print-sheet-footer';

      const page = document.createElement('span');
      page.className = 'cv-print-sheet-page';
      footer.appendChild(page);

      sheet.appendChild(header);
      sheet.appendChild(content);
      sheet.appendChild(footer);

      output.appendChild(sheet);

      return { content, page };
    };

    const sheets: Array<{
      content: HTMLDivElement;
      page: HTMLSpanElement;
    }> = [];

    let currentSheet = createSheet();
    sheets.push(currentSheet);

    for (const block of blocks) {
      const clone = block.cloneNode(true) as HTMLElement;
      currentSheet.content.appendChild(clone);

      if (
        currentSheet.content.scrollHeight > currentSheet.content.clientHeight
      ) {
        currentSheet.content.removeChild(clone);
        currentSheet = createSheet();
        sheets.push(currentSheet);
        currentSheet.content.appendChild(clone);
      }
    }

    const totalPages = sheets.length;
    sheets.forEach((sheet, index) => {
      sheet.page.textContent = `Page ${index + 1} of ${totalPages}`;
    });
  }, [cvTitle, printDate]);

  useEffect(() => {
    const runBuild = () => {
      window.requestAnimationFrame(() => {
        buildPrintPages();
      });
    };

    runBuild();

    const onResize = () => {
      runBuild();
    };

    const onBeforePrint = () => {
      runBuild();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('beforeprint', onBeforePrint);

    const printMedia = window.matchMedia('print');
    const onPrintMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        runBuild();
      }
    };

    if (typeof printMedia.addEventListener === 'function') {
      printMedia.addEventListener('change', onPrintMediaChange);
    }

    if (document.fonts) {
      void document.fonts.ready.then(() => {
        runBuild();
      });
    }

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('beforeprint', onBeforePrint);

      if (typeof printMedia.removeEventListener === 'function') {
        printMedia.removeEventListener('change', onPrintMediaChange);
      }
    };
  }, [buildPrintPages, rebuildSignal]);

  return { printSourceRef, printOutputRef };
}
