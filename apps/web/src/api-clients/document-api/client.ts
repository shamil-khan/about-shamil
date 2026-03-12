import axios, { type AxiosInstance, type AxiosError } from 'axios';
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

// ─── Client (Facade) ────────────────────────────────────────────

const API_DOCS_PATH = '/api/docs';
export class DocumentApiClient {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
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
    return (
      await this.http.get<Document>(`${API_DOCS_PATH}/default`, { params })
    ).data;
  }

  // ── Metadata Queries ───────────────────────────────────────────

  async getAllDocumentsMetadata(): Promise<DocumentMetadata[]> {
    return (await this.http.get<DocumentMetadata[]>(API_DOCS_PATH)).data;
  }

  async getUserDocumentsMetadata(userId: string): Promise<DocumentMetadata[]> {
    return (
      await this.http.get<DocumentMetadata[]>(API_DOCS_PATH, {
        params: { 'user-id': userId },
      })
    ).data;
  }

  async getDocumentMetadata(docId: string): Promise<DocumentMetadata> {
    return (
      await this.http.get<DocumentMetadata>(API_DOCS_PATH, {
        params: { 'doc-id': docId },
      })
    ).data;
  }

  // ── Full Document Queries ──────────────────────────────────────

  async getDocument(docId: string): Promise<Document> {
    return (
      await this.http.get<Document>(`${API_DOCS_PATH}/doc`, {
        params: { 'doc-id': docId },
      })
    ).data;
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    return (
      await this.http.get<Document[]>(`${API_DOCS_PATH}/doc`, {
        params: { 'user-id': userId },
      })
    ).data;
  }

  // ── Mutations ──────────────────────────────────────────────────

  async createDocument(request: DocumentApiRequest): Promise<DocumentResponse> {
    return (await this.http.post<DocumentResponse>(API_DOCS_PATH, request))
      .data;
  }

  async updateDocumentContent(
    docId: string,
    content: ContentPayload,
  ): Promise<DocumentResponse> {
    return (
      await this.http.put<DocumentResponse>(API_DOCS_PATH, content, {
        params: { 'doc-id': docId },
      })
    ).data;
  }

  async deleteDocument(docId: string): Promise<DocumentResponse> {
    return (
      await this.http.delete<DocumentResponse>(API_DOCS_PATH, {
        params: { 'doc-id': docId },
      })
    ).data;
  }

  // ── User Management (Admin) ────────────────────────────────────

  async getAllUsers(): Promise<string[]> {
    return (await this.http.get<string[]>(`${API_DOCS_PATH}/users`)).data;
  }

  async deleteUser(userId: string): Promise<DocumentResponse[]> {
    return (
      await this.http.delete<DocumentResponse[]>(`${API_DOCS_PATH}/users`, {
        params: { 'user-id': userId },
      })
    ).data;
  }

  // ── Batch Operations (Admin) ───────────────────────────────────

  async batchDeleteDocuments(ids: string[]): Promise<DocumentResponse[]> {
    return (
      await this.http.delete<DocumentResponse[]>(
        `${API_DOCS_PATH}/batch-documents`,
        {
          data: { ids },
        },
      )
    ).data;
  }

  async batchDeleteUsers(ids: string[]): Promise<DocumentResponse[]> {
    return (
      await this.http.delete<DocumentResponse[]>(
        `${API_DOCS_PATH}/batch-users`,
        {
          data: { ids },
        },
      )
    ).data;
  }

  async resetStore(): Promise<DocumentStoreResetResponse> {
    return (
      await this.http.delete<DocumentStoreResetResponse>(
        `${API_DOCS_PATH}/reset-store`,
      )
    ).data;
  }
}

// ─── Factory ─────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // || 'http://localhost:8787';
console.log(`API_BASE_URL is ${API_BASE_URL}`);

export const createDocumentApiClient = (): DocumentApiClient =>
  new DocumentApiClient(
    axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }),
  );
