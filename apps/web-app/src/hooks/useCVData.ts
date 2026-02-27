import { useState, useEffect } from 'react';
import type { CVData } from '@/types/cv';

// Static import for now - will be replaced with API call
import cvDataJson from '@/data/cv-data.json';

interface UseCVDataOptions {
  locale?: string;
}

interface UseCVDataReturn {
  data: CVData | null;
  isLoading: boolean;
  error: Error | null;
  isRTL: boolean;
}

const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

export function useCVData(options: UseCVDataOptions = {}): UseCVDataReturn {
  const { locale = 'en' } = options;
  const [data, setData] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isRTL = RTL_LOCALES.includes(locale.split('-')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with API call when backend is ready
        // const response = await fetch(`/api/cv?locale=${locale}`);
        // const json = await response.json();

        // Simulate async behavior for future API compatibility
        await new Promise((resolve) => setTimeout(resolve, 0));

        setData(cvDataJson as CVData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load CV data'),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  return { data, isLoading, error, isRTL };
}
