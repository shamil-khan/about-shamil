import { type LanguageCode } from '@/config';
// ─── Content Types ───────────────────────────────────────────────

export type MimeType =
  | 'text/plain'
  | 'text/html'
  | 'text/markdown'
  | 'application/json'
  | 'application/pdf'
  | 'application/octet-stream'
  | (string & {});

export type ContentEncoding = 'utf-8' | 'base64' | 'binary';

export interface InlineContent {
  readonly type: 'inline';
  readonly data: string;
  readonly mimeType: MimeType;
  readonly fileName: string;
  readonly size: number;
  readonly encoding: ContentEncoding;
}

export interface ChunkedContent {
  readonly type: 'chunked';
  readonly totalChunks: number;
  readonly chunkSize: number;
  readonly totalSize: number;
  readonly mimeType: MimeType;
  readonly fileName: string;
  readonly checksum: string;
  readonly chunkKeys: readonly string[];
}

export interface ExternalContent {
  readonly type: 'external';
  readonly provider: 'r2' | 's3' | 'gcs';
  readonly bucket: string;
  readonly key: string;
  readonly mimeType: MimeType;
  readonly fileName: string;
  readonly size: number;
  readonly checksum: string;
}

export type DocumentContent = InlineContent | ChunkedContent | ExternalContent;

// ─── Type Guards ─────────────────────────────────────────────────

export const isInlineContent = (c: DocumentContent): c is InlineContent =>
  c.type === 'inline';
export const isChunkedContent = (c: DocumentContent): c is ChunkedContent =>
  c.type === 'chunked';
export const isExternalContent = (c: DocumentContent): c is ExternalContent =>
  c.type === 'external';

// ─── Domain Models ───────────────────────────────────────────────

export interface Document {
  readonly id: string;
  readonly userId: string;
  readonly languageCode: LanguageCode;
  readonly profileName: string;
  readonly content: DocumentContent;
  readonly createdOn: string;
  readonly updatedOn?: string;
}

export interface ContentMetadata {
  readonly mimeType: MimeType;
  readonly fileName: string;
  readonly size: number;
  readonly storageType: 'inline' | 'chunked' | 'external';
}

export interface DocumentMetadata {
  readonly id: string;
  readonly userId: string;
  readonly profileName: string;
  readonly languageCode: LanguageCode;
  readonly contentInfo: ContentMetadata;
}

// ─── Request / Response DTOs ─────────────────────────────────────

export interface ContentPayload {
  readonly data: string;
  readonly mimeType: MimeType;
  readonly fileName: string;
  readonly encoding: ContentEncoding;
}

export interface DocumentApiRequest {
  readonly profileName: string;
  readonly languageCode: LanguageCode;
  readonly content: ContentPayload;
}

export interface DocumentResponse {
  readonly documentId: string;
  readonly timestamp: string;
  readonly status: boolean;
  readonly message: string;
}

export interface DocumentStoreResetResponse {
  readonly status: boolean;
  readonly message: string;
}

// ─── API Error ───────────────────────────────────────────────────

export interface ApiErrorData {
  readonly error?: string;
  readonly message?: string;
  readonly [key: string]: unknown;
}
