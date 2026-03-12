import { QueryClient } from '@tanstack/query-core';
import { useState, useEffect } from 'react';
import { documentApiClientSafe } from '@/api-wrappers/DocumentApi/DocumentApiClient';
import { createCVProcessor, type CVDocument } from 'cv-processor';
import { selectLanguage, useLanguageStore } from '@/store';

const userId = 'test-user';
const queryClient = new QueryClient();

interface UseCVDocumentReturn {
  cvDocument: CVDocument | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCVDocument(): UseCVDocumentReturn {
  const language = useLanguageStore(selectLanguage);
  const [state, setState] = useState<{
    data: CVDocument | null;
    loading: boolean;
    error: unknown;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const cached = queryClient.getQueryData<CVDocument>([
        'cvDocument',
        userId,
        language,
      ]);

      if (!cached) {
        setState((prev) => ({ ...prev, loading: true }));
      }

      try {
        const data = await queryClient.fetchQuery({
          queryKey: ['cvDocument', userId, language],
          queryFn: async () => {
            const response = await documentApiClientSafe.getIdentity(
              userId,
              language,
            );
            if (!response.success)
              throw new Error(`Api response is failed. reponse: ${response}`);
            if (response.data.content.type !== 'inline')
              throw new Error(
                `Content type is not supported. document: ${response.data}`,
              );

            return createCVProcessor().parseContent(
              response.data.content.data,
              'yaml',
            );
          },
          staleTime: 1000 * 60 * 5, // Caching
        });
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (err) {
        if (isMounted) {
          setState({ data: null, loading: false, error: err });
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [language]);

  return {
    cvDocument: state.data,
    isLoading: state.loading,
    error: state.error as Error,
  };
}
