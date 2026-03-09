// ============================================================================
// Document API Client (Axios Implementation)
// ============================================================================
// Industry-standard HTTP client with strong typing, interceptors for auth,
// request cancellation, and automatic error handling.
// ============================================================================
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type Canceler,
} from 'axios';

/**
 * API error response structure.
 * Used for consistent error handling across the application.
 */
export type ApiError = {
  /** Error message */
  readonly error: string;
};

/**
 * Result type for API operations.
 * Enforces explicit error handling with discriminated union.
 */
export type ApiResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };

// ============================================================================
// Axios Instance Configuration
// ============================================================================

/**
 * Base URL for the document API.
 * Loaded from environment variables with fallback for development.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

if (!API_BASE_URL) {
  console.log('Api base Url is not valid', API_BASE_URL);
}

/**
 * Axios instance configured for the document API.
 * Includes default headers, timeout, and auth interceptor hooks.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ============================================================================
// Request/Response Interceptors (Auth Hook Points)
// ============================================================================

/**
 * Request interceptor for adding authentication headers.
 * Currently a hook point - will be implemented when auth is added.
 */
apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    // TODO: Add JWT/OAuth token when auth implementation is complete
    // const token = await authStore.getToken();
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor for global error handling and token refresh.
 * Currently a hook point - will handle 401 refresh when auth is added.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError<ApiError>): Promise<AxiosError | AxiosResponse> => {
    if (error.response?.status === 401) {
      // TODO: Handle token refresh or redirect to login when auth is added
      // const refreshed = await authStore.refreshToken();
      // if (refreshed && error.config) {
      //   return apiClient.request(error.config);
      // }
    }
    return Promise.reject(error);
  },
);

// ============================================================================
// Request Cancellation Utilities
// ============================================================================

/**
 * Creates a cancel token source for request cancellation.
 * Use this when a component unmounts to cancel pending requests.
 * @returns Object with token and cancel function
 */
export const createCancelToken = (): {
  token: AbortController;
  cancel: Canceler;
} => {
  const controller = new AbortController();
  const cancel: Canceler = (message?: string): void => {
    controller.abort(message);
  };
  return { token: controller, cancel };
};
