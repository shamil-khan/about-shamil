import { useState, useEffect } from 'react';
import type { CVData } from '@/types/cv';
import { documentApiClientSafe } from '@/api-wrappers/DocumentApi/DocumentApiClient';
import { toast } from 'sonner';
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
        const useApi = false;
        setIsLoading(true);
        setError(null);

        if (useApi) {
          const response = await documentApiClientSafe.getIdentity('test-user');
          console.log('reponse', response);
          if (!response.success) {
            toast.error(`Failed to load document: ${response.error}`);
            return;
          }
          const document = response.data;
          if (document.content.type === 'inline') {
            console.log('reponse - content', document.content);
            setData(document.content.data as CVData);
          } else if (document.content.type === 'chunked') {
            toast.error(`Failed to load document: ${document.content}`);
          } else if (document.content.type === 'external') {
            toast.error(`Failed to load document: ${document.content}`);
          }

          console.log('reponse', response);
        } else {
          setData(cvDataJson as CVData);
        }
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
