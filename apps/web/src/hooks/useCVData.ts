import { useState, useEffect } from 'react';
import { documentApiClientSafe } from '@/api-wrappers/DocumentApi/DocumentApiClient';
import { createCVProcessor, type CVDocument } from 'cv-processor';

interface UseCVDataOptions {
  locale?: string;
}

interface UseCVDataReturn {
  cvDocument: CVDocument | null;
  isLoading: boolean;
  error: Error | null;
  isRTL: boolean;
}

const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

export function useCVData(options: UseCVDataOptions = {}): UseCVDataReturn {
  const { locale = 'en' } = options;
  const [cvDocument, setCVDocument] = useState<CVDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isRTL = RTL_LOCALES.includes(locale.split('-')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await documentApiClientSafe.getIdentity(
          'test-user',
          locale,
        );

        if (!response.success) {
          setError(new Error(`Api response is failed. reponse: ${response}`));
          return;
        }

        if (response.data.content.type !== 'inline') {
          setError(
            new Error(
              `Content type is not supported. document: ${response.data}`,
            ),
          );
          return;
        }

        const rawContent = response.data.content.data;
        const processor = createCVProcessor();
        const document = processor.parseContent(rawContent, 'yaml');
        console.log(document, document);
        setCVDocument(document);
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

  return { cvDocument, isLoading, error, isRTL };
}
