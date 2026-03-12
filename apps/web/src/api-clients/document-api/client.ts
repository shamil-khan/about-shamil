import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from 'axios';
import type {
  Document,
  DocumentMetadata,
  DocumentApiRequest,
  DocumentResponse,
  DocumentStoreResetResponse,
  ContentPayload,
  ApiErrorData,
} from './types';

// ─── Error ───────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly status: number;
  public readonly data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (axios.isAxiosError(error)) {
      const axErr = error as AxiosError<ApiErrorData>;
      const msg =
        axErr.response?.data?.message ??
        axErr.response?.data?.error ??
        axErr.message;
      return new ApiError(
        msg,
        axErr.response?.status ?? 0,
        axErr.response?.data,
      );
    }
    return new ApiError(
      error instanceof Error ? error.message : String(error),
      0,
    );
  }
}

// ─── Config ──────────────────────────────────────────────────────

export interface DocumentClientConfig {
  /** Base URL of the document API (e.g. "/api/documents") */
  baseURL: string;
  /** Supply your own Axios instance (auth interceptors, etc.) */
  httpClient?: AxiosInstance;
  /** Extra Axios config — ignored when httpClient is provided */
  axiosConfig?: AxiosRequestConfig;
}

// ─── Client (Facade) ────────────────────────────────────────────

export class DocumentApiClient {
  private readonly http: AxiosInstance;

  constructor(config: DocumentClientConfig) {
    this.http =
      config.httpClient ??
      axios.create({
        baseURL: config.baseURL,
        headers: { 'Content-Type': 'application/json' },
        ...config.axiosConfig,
      });

    // Ensure base URL is set even on injected instances
    if (!config.httpClient) {
      // already set via create
    } else if (!this.http.defaults.baseURL) {
      this.http.defaults.baseURL = config.baseURL;
    }

    // Uniform error transformation (Interceptor pattern)
    this.http.interceptors.response.use(
      (res) => res,
      (err) => Promise.reject(ApiError.from(err)),
    );
  }

  /** Expose underlying Axios instance for advanced use */
  get axios(): AxiosInstance {
    return this.http;
  }

  // ── Default Document ───────────────────────────────────────────

  async getDefaultDocument(
    userId: string,
    languageCode?: string,
  ): Promise<Document> {
    const params: Record<string, string> = { 'user-id': userId };
    if (languageCode) params['language-code'] = languageCode;
    return (await this.http.get<Document>('/default', { params })).data;
  }

  // ── Metadata Queries ───────────────────────────────────────────

  async getAllDocumentsMetadata(): Promise<DocumentMetadata[]> {
    return (await this.http.get<DocumentMetadata[]>('/')).data;
  }

  async getUserDocumentsMetadata(userId: string): Promise<DocumentMetadata[]> {
    return (
      await this.http.get<DocumentMetadata[]>('/', {
        params: { 'user-id': userId },
      })
    ).data;
  }

  async getDocumentMetadata(docId: string): Promise<DocumentMetadata> {
    return (
      await this.http.get<DocumentMetadata>('/', {
        params: { 'doc-id': docId },
      })
    ).data;
  }

  // ── Full Document Queries ──────────────────────────────────────

  async getDocument(docId: string): Promise<Document> {
    return (
      await this.http.get<Document>('/doc', {
        params: { 'doc-id': docId },
      })
    ).data;
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    return (
      await this.http.get<Document[]>('/doc', {
        params: { 'user-id': userId },
      })
    ).data;
  }

  // ── Mutations ──────────────────────────────────────────────────

  async createDocument(request: DocumentApiRequest): Promise<DocumentResponse> {
    return (await this.http.post<DocumentResponse>('/', request)).data;
  }

  async updateDocumentContent(
    docId: string,
    content: ContentPayload,
  ): Promise<DocumentResponse> {
    return (
      await this.http.put<DocumentResponse>('/', content, {
        params: { 'doc-id': docId },
      })
    ).data;
  }

  async deleteDocument(docId: string): Promise<DocumentResponse> {
    return (
      await this.http.delete<DocumentResponse>('/', {
        params: { 'doc-id': docId },
      })
    ).data;
  }

  // ── User Management (Admin) ────────────────────────────────────

  async getAllUsers(): Promise<string[]> {
    return (await this.http.get<string[]>('/users')).data;
  }

  async deleteUser(userId: string): Promise<DocumentResponse[]> {
    return (
      await this.http.delete<DocumentResponse[]>('/users', {
        params: { 'user-id': userId },
      })
    ).data;
  }

  // ── Batch Operations (Admin) ───────────────────────────────────

  async batchDeleteDocuments(ids: string[]): Promise<DocumentResponse[]> {
    return (
      await this.http.delete<DocumentResponse[]>('/batch-documents', {
        data: { ids },
      })
    ).data;
  }

  async batchDeleteUsers(ids: string[]): Promise<DocumentResponse[]> {
    return (
      await this.http.delete<DocumentResponse[]>('/batch-users', {
        data: { ids },
      })
    ).data;
  }

  async resetStore(): Promise<DocumentStoreResetResponse> {
    return (await this.http.delete<DocumentStoreResetResponse>('/reset-store'))
      .data;
  }
}

// ─── Factory ─────────────────────────────────────────────────────

export const createDocumentApiClient = (
  config: DocumentClientConfig,
): DocumentApiClient => new DocumentApiClient(config);
