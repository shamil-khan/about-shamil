import { useState, useEffect } from 'react';
import { QueryClient } from '@tanstack/query-core';
import { createCVProcessor, type CVDocument } from 'cv-processor';
import { selectLanguage, useLanguageStore } from '@/store';
import { createDocumentApiClient, ApiError } from '@/api-clients';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // || 'http://localhost:8787';
const API_DOCS_PATH = `${API_BASE_URL}/api/docs`;

if (!API_BASE_URL) {
  console.log('Api base Url is not valid', API_BASE_URL);
}

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
        const documentApiClient = createDocumentApiClient({
          baseURL: API_DOCS_PATH,
        });

        const data = await queryClient.fetchQuery({
          queryKey: ['cvDocument', userId, language],
          queryFn: async () => {
            const document = await documentApiClient.getDefaultDocument(
              userId,
              language,
            );
            if (document.content.type !== 'inline')
              throw new Error(
                `Content type is not supported. document: ${document.content.type}`,
              );

            return createCVProcessor().parseContent(
              document.content.data,
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
        if (err instanceof ApiError) {
          console.error(`[${err.status}] ${err.message}`);
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
