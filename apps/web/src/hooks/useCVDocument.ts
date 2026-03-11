import { useState, useEffect } from 'react';
import { documentApiClientSafe } from '@/api-wrappers/DocumentApi/DocumentApiClient';
import { createCVProcessor, type CVDocument } from 'cv-processor';
import { selectLanguage, useLanguageStore } from '@/store';

interface UseCVDocumentReturn {
  cvDocument: CVDocument | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCVDocument(): UseCVDocumentReturn {
  const language = useLanguageStore(selectLanguage);
  const [cvDocument, setCVDocument] = useState<CVDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await documentApiClientSafe.getIdentity(
          'test-user',
          language,
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
  }, [language]);

  return { cvDocument, isLoading, error };
}
