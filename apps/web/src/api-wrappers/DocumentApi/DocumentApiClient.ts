// ============================================================================
// Document API Client (Axios Implementation)
// ============================================================================
// Industry-standard HTTP client with strong typing, interceptors for auth,
// request cancellation, and automatic error handling.
// ============================================================================
import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

import { apiClient } from '@/api-wrappers/ApiClient';
import type { ApiError, ApiResult } from '@/api-wrappers/ApiClient';

import type {
  Document,
  DocumentMetadata,
  DocumentApiRequest,
  DocumentResponse,
  DocumentStoreResetResponse,
} from '@/api-wrappers/DocumentApi/document';

// ============================================================================
// Axios Instance Configuration
// ============================================================================

/**
 * Base URL for the document API.
 * Loaded from environment variables with fallback for development.
 */
const API_DOCS_PATH = '/api/docs';

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Custom error class for document API operations.
 * Wraps Axios errors with additional context for UI handling.
 */
export class DocumentApiError extends Error {
  /** HTTP status code from the response */
  public readonly statusCode: number;
  /** Original Axios error for advanced handling */
  public readonly axiosError: AxiosError<ApiError> | null;
  /** API error response body if available */
  public readonly apiError: ApiError | null;

  /**
   * Creates a new DocumentApiError.
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code
   * @param axiosError - Original Axios error
   * @param apiError - Parsed API error response
   */
  constructor(
    message: string,
    statusCode: number,
    axiosError: AxiosError<ApiError> | null,
    apiError: ApiError | null,
  ) {
    super(message);
    this.name = 'DocumentApiError';
    this.statusCode = statusCode;
    this.axiosError = axiosError;
    this.apiError = apiError;
  }
}

/**
 * Type guard to check if an error is a DocumentApiError.
 * @param error - The error to check
 * @returns True if error is DocumentApiError, false otherwise
 */
export const isDocumentApiError = (error: unknown): error is DocumentApiError =>
  error instanceof DocumentApiError;

/**
 * Extracts a human-readable error message from an Axios error.
 * @param error - The Axios error to parse
 * @returns Error message string
 */
const extractErrorMessage = (error: AxiosError<ApiError>): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unknown error occurred';
};

/**
 * Transforms an Axios error into a DocumentApiError.
 * @param error - The error to transform
 * @returns DocumentApiError with structured error information
 */
const transformError = (error: unknown): DocumentApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    const statusCode = axiosError.response?.status ?? 0;
    const message = extractErrorMessage(axiosError);
    const apiError = axiosError.response?.data ?? null;
    return new DocumentApiError(message, statusCode, axiosError, apiError);
  }

  if (error instanceof Error) {
    return new DocumentApiError(error.message, 0, null, null);
  }

  return new DocumentApiError('An unknown error occurred', 0, null, null);
};

// ============================================================================
// HTTP Method Wrappers
// ============================================================================

/**
 * Performs a typed GET request.
 * @param url - The URL path
 * @param config - Optional Axios request configuration
 * @returns Promise resolving to response data of type T
 * @throws DocumentApiError on failure
 */
const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    throw transformError(error);
  }
};

/**
 * Performs a typed POST request.
 * @param url - The URL path
 * @param data - The request body
 * @param config - Optional Axios request configuration
 * @returns Promise resolving to response data of type T
 * @throws DocumentApiError on failure
 */
const post = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    throw transformError(error);
  }
};

/**
 * Performs a typed PUT request.
 * @param url - The URL path
 * @param data - The request body
 * @param config - Optional Axios request configuration
 * @returns Promise resolving to response data of type T
 * @throws DocumentApiError on failure
 */
const put = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.put(url, data, config);
    return response.data;
  } catch (error) {
    throw transformError(error);
  }
};

/**
 * Performs a typed DELETE request.
 * @param url - The URL path
 * @param config - Optional Axios request configuration
 * @returns Promise resolving to response data of type T
 * @throws DocumentApiError on failure
 */
const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    throw transformError(error);
  }
};

/**
 * API endpoint paths for document operations.
 * All paths are relative to the base URL.
 */
const ENDPOINTS = {
  /** Root documents endpoint */
  DOCUMENTS: `${API_DOCS_PATH}`,
  /** Users list endpoint */
  USERS: `${API_DOCS_PATH}/users`,
  /** Batch document operations */
  BATCH_DOCUMENTS: `${API_DOCS_PATH}/batch-documents`,
  /** Batch user operations */
  BATCH_USERS: `${API_DOCS_PATH}/batch-users`,
  /** Store reset endpoint */
  RESET_STORE: `${API_DOCS_PATH}/reset-store`,
  /** Single document by ID */
  DOCUMENT: (id: string): string =>
    `${API_DOCS_PATH}/${encodeURIComponent(id)}`,
  /** Document metadata by ID */
  DOCUMENT_METADATA: (id: string): string =>
    `${API_DOCS_PATH}/${encodeURIComponent(id)}/metadata`,
  /** User documents endpoint */
  USER_DOCUMENTS: (userId: string): string =>
    `${API_DOCS_PATH}/user/${encodeURIComponent(userId)}`,
  /** User documents metadata endpoint */
  USER_DOCUMENTS_METADATA: (userId: string): string =>
    `${API_DOCS_PATH}/user/${encodeURIComponent(userId)}/metadata`,
  /** Single user endpoint */
  USER: (userId: string): string =>
    `${API_DOCS_PATH}/user/${encodeURIComponent(userId)}`,
  IDENTITY: (userId: string, languageCode?: string): string =>
    languageCode
      ? `${API_DOCS_PATH}/identity/${encodeURIComponent(userId)}/${encodeURIComponent(languageCode)}`
      : `${API_DOCS_PATH}/identity/${encodeURIComponent(userId)}`,
} as const;

/**
 * Document API client.
 * Provides operations for system-wide document and user management.
 * All operations require appropriate admin privileges.
 */
export const documentApiClient = {
  /**
   * Deletes multiple documents by their IDs.
   * @param documentIds - Array of document IDs to delete
   * @returns Array of deletion responses with status for each document
   * @throws DocumentApiError on failure (400 for invalid input, 403 for unauthorized)
   */
  deleteDocuments: async (
    documentIds: readonly string[],
  ): Promise<DocumentResponse[]> => {
    if (documentIds.length === 0) {
      throw new DocumentApiError(
        'Document IDs array cannot be empty',
        400,
        null,
        null,
      );
    }
    return del<DocumentResponse[]>(ENDPOINTS.BATCH_DOCUMENTS, {
      data: { ids: documentIds },
    });
  },

  /**
   * Deletes a single user and all their associated documents.
   * @param userId - The user ID to delete
   * @returns Array of deletion responses (one per deleted document)
   * @throws DocumentApiError on failure
   */
  deleteUser: async (userId: string): Promise<DocumentResponse[]> => {
    if (!userId) {
      throw new DocumentApiError('User ID cannot be empty', 400, null, null);
    }
    return del<DocumentResponse[]>(ENDPOINTS.USER(userId));
  },

  /**
   * Deletes multiple users and all their associated documents.
   * @param userIds - Array of user IDs to delete
   * @returns Array of deletion responses
   * @throws DocumentApiError on failure
   */
  deleteUsers: async (
    userIds: readonly string[],
  ): Promise<DocumentResponse[]> => {
    if (userIds.length === 0) {
      throw new DocumentApiError(
        'User IDs array cannot be empty',
        400,
        null,
        null,
      );
    }
    return del<DocumentResponse[]>(ENDPOINTS.BATCH_USERS, {
      data: { ids: userIds },
    });
  },

  getAllDocuments: async (): Promise<DocumentMetadata[]> => {
    return get<DocumentMetadata[]>(ENDPOINTS.DOCUMENTS);
  },

  /**
   * Retrieves all user IDs in the system.
   * @returns Array of user ID strings
   * @throws DocumentApiError on failure
   */
  getAllUsers: async (): Promise<string[]> => {
    return get<string[]>(ENDPOINTS.USERS);
  },

  /**
   * Resets the entire document store.
   * WARNING: This operation deletes all data and cannot be undone.
   * @returns Reset response with status and summary message
   * @throws DocumentApiError on failure
   */
  resetStore: async (): Promise<DocumentStoreResetResponse> => {
    return del<DocumentStoreResetResponse>(ENDPOINTS.RESET_STORE);
  },

  /**
   * Creates a new document for the specified user.
   * @param request - The document creation request with content payload
   * @returns Document response with creation details and generated ID
   * @throws DocumentApiError on failure (400 for invalid input, 409 for duplicate)
   */
  addDocument: async (
    request: DocumentApiRequest,
  ): Promise<DocumentResponse> => {
    if (!request.profileName) {
      throw new DocumentApiError('Profile name is required', 400, null, null);
    }
    if (!request.languageCode) {
      throw new DocumentApiError('Language code is required', 400, null, null);
    }
    if (!request.content) {
      throw new DocumentApiError('Content is required', 400, null, null);
    }
    return post<DocumentResponse>(ENDPOINTS.DOCUMENTS, request);
  },

  /**
   * Updates the content of an existing document.
   * @param documentId - The document ID to update
   * @param content - The new content payload
   * @returns Document response with update details and timestamp
   * @throws DocumentApiError on failure (404 if document not found)
   */
  updateContent: async (
    documentId: string,
    content: { readonly content: unknown },
  ): Promise<DocumentResponse> => {
    if (!documentId) {
      throw new DocumentApiError(
        'Document ID cannot be empty',
        400,
        null,
        null,
      );
    }
    return put<DocumentResponse>(ENDPOINTS.DOCUMENT(documentId), content);
  },

  /**
   * Deletes a specific document.
   * @param documentId - The document ID to delete
   * @returns Document response with deletion confirmation
   * @throws DocumentApiError on failure (404 if document not found)
   */
  deleteDocument: async (documentId: string): Promise<DocumentResponse> => {
    if (!documentId) {
      throw new DocumentApiError(
        'Document ID cannot be empty',
        400,
        null,
        null,
      );
    }
    return del<DocumentResponse>(ENDPOINTS.DOCUMENT(documentId));
  },

  /**
   * Retrieves a specific document by ID, including its full content.
   * @param documentId - The document ID to retrieve
   * @returns The full document with content payload
   * @throws DocumentApiError on failure (404 if document not found)
   */
  getDocument: async (documentId: string): Promise<Document> => {
    if (!documentId) {
      throw new DocumentApiError(
        'Document ID cannot be empty',
        400,
        null,
        null,
      );
    }
    return get<Document>(ENDPOINTS.DOCUMENT(documentId));
  },

  /**
   * Retrieves metadata for a specific document (excludes content).
   * @param documentId - The document ID to retrieve metadata for
   * @returns Document metadata
   * @throws DocumentApiError on failure (404 if document not found)
   */
  getDocumentMetadata: async (
    documentId: string,
  ): Promise<DocumentMetadata> => {
    if (!documentId) {
      throw new DocumentApiError(
        'Document ID cannot be empty',
        400,
        null,
        null,
      );
    }
    return get<DocumentMetadata>(ENDPOINTS.DOCUMENT_METADATA(documentId));
  },

  /**
   * Retrieves all documents for a specific user, including content.
   * @param userId - The user ID to retrieve documents for
   * @returns Array of full documents
   * @throws DocumentApiError on failure
   */
  getDocuments: async (userId: string): Promise<Document[]> => {
    if (!userId) {
      throw new DocumentApiError('User ID cannot be empty', 400, null, null);
    }
    return get<Document[]>(ENDPOINTS.USER_DOCUMENTS(userId));
  },

  /**
   * Retrieves metadata for all documents belonging to a specific user.
   * @param userId - The user ID to retrieve document metadata for
   * @returns Array of document metadata (excludes content)
   * @throws DocumentApiError on failure
   */
  getDocumentsMetadata: async (userId: string): Promise<DocumentMetadata[]> => {
    if (!userId) {
      throw new DocumentApiError('User ID cannot be empty', 400, null, null);
    }
    return get<DocumentMetadata[]>(ENDPOINTS.USER_DOCUMENTS_METADATA(userId));
  },
  getIdentity: async (
    userId: string,
    languageCode?: string,
  ): Promise<Document> => {
    if (!userId) {
      throw new DocumentApiError(
        'UserId  can not be null cannot be empty',
        400,
        null,
        null,
      );
    }
    return get<Document>(ENDPOINTS.IDENTITY(userId, languageCode));
  },
} as const;

// ============================================================================
// Result Wrapper API (Explicit Error Handling)
// ============================================================================

/**
 * Wraps an API call in a result type for explicit error handling.
 * @param operation - The async operation to wrap
 * @returns ApiResult with either success data or error message
 */
const wrapResult = async <T>(
  operation: () => Promise<T>,
): Promise<ApiResult<T>> => {
  try {
    const data = await operation();
    return { success: true, data } as const;
  } catch (error) {
    if (isDocumentApiError(error)) {
      return { success: false, error: error.message } as const;
    }
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: 'An unknown error occurred' } as const;
  }
};

/**
 * System Admin API with result wrapper.
 * All methods return ApiResult for explicit error handling without exceptions.
 */
export const documentApiClientSafe = {
  deleteDocuments: (
    documentIds: readonly string[],
  ): Promise<ApiResult<DocumentResponse[]>> =>
    wrapResult(() => documentApiClient.deleteDocuments(documentIds)),
  deleteUser: (userId: string): Promise<ApiResult<DocumentResponse[]>> =>
    wrapResult(() => documentApiClient.deleteUser(userId)),
  deleteUsers: (
    userIds: readonly string[],
  ): Promise<ApiResult<DocumentResponse[]>> =>
    wrapResult(() => documentApiClient.deleteUsers(userIds)),
  getAllDocuments: (): Promise<ApiResult<DocumentMetadata[]>> =>
    wrapResult(() => documentApiClient.getAllDocuments()),
  getAllUsers: (): Promise<ApiResult<string[]>> =>
    wrapResult(() => documentApiClient.getAllUsers()),
  resetStore: (): Promise<ApiResult<DocumentStoreResetResponse>> =>
    wrapResult(() => documentApiClient.resetStore()),
  addDocument: (
    request: DocumentApiRequest,
  ): Promise<ApiResult<DocumentResponse>> =>
    wrapResult(() => documentApiClient.addDocument(request)),
  updateContent: (
    documentId: string,
    content: { readonly content: unknown },
  ): Promise<ApiResult<DocumentResponse>> =>
    wrapResult(() => documentApiClient.updateContent(documentId, content)),
  deleteDocument: (documentId: string): Promise<ApiResult<DocumentResponse>> =>
    wrapResult(() => documentApiClient.deleteDocument(documentId)),
  getDocument: (documentId: string): Promise<ApiResult<Document>> =>
    wrapResult(() => documentApiClient.getDocument(documentId)),
  getDocumentMetadata: (
    documentId: string,
  ): Promise<ApiResult<DocumentMetadata>> =>
    wrapResult(() => documentApiClient.getDocumentMetadata(documentId)),
  getDocuments: (userId: string): Promise<ApiResult<Document[]>> =>
    wrapResult(() => documentApiClient.getDocuments(userId)),
  getDocumentsMetadata: (
    userId: string,
  ): Promise<ApiResult<DocumentMetadata[]>> =>
    wrapResult(() => documentApiClient.getDocumentsMetadata(userId)),
  getIdentity: async (
    userId: string,
    languageCode?: string,
  ): Promise<ApiResult<Document>> =>
    wrapResult(() => documentApiClient.getIdentity(userId, languageCode)),
} as const;
