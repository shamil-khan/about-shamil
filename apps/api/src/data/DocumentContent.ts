// --- FILE: apps/api/src/data/DocumentContent.ts ---

/** Maximum size for inline content storage (1MB) */
export const MAX_INLINE_CONTENT_SIZE = 1024 * 1024;

/** Supported MIME types */
export type MimeType =
  | 'text/plain'
  | 'text/html'
  | 'text/markdown'
  | 'application/json'
  | 'application/pdf'
  | 'application/octet-stream'
  | string;

/** Content encoding types */
export type ContentEncoding = 'utf-8' | 'base64' | 'binary';

/**
 * Inline content for small files (stored directly in document).
 */
export type InlineContent = {
  type: 'inline';
  /** Content data (Base64 encoded for binary, plain for text) */
  data: string;
  /** MIME type */
  mimeType: MimeType;
  /** Original filename */
  fileName: string;
  /** Size in bytes */
  size: number;
  /** Encoding used */
  encoding: ContentEncoding;
};

/**
 * Chunked content reference for large files.
 */
export type ChunkedContent = {
  type: 'chunked';
  /** Total number of chunks */
  totalChunks: number;
  /** Size of each chunk in bytes */
  chunkSize: number;
  /** Total content size in bytes */
  totalSize: number;
  /** MIME type */
  mimeType: MimeType;
  /** Original filename */
  fileName: string;
  /** SHA-256 checksum for integrity */
  checksum: string;
  /** Redis keys for each chunk */
  chunkKeys: readonly string[];
};

/**
 * External storage reference (e.g., S3, R2).
 */
export type ExternalContent = {
  type: 'external';
  /** Storage provider */
  provider: 'r2' | 's3' | 'gcs';
  /** Bucket name */
  bucket: string;
  /** Object key */
  key: string;
  /** MIME type */
  mimeType: MimeType;
  /** Original filename */
  fileName: string;
  /** Size in bytes */
  size: number;
  /** SHA-256 checksum */
  checksum: string;
};

/**
 * Union type for all content storage strategies.
 */
export type DocumentContent = InlineContent | ChunkedContent | ExternalContent;

/**
 * Type guard for inline content.
 */
export const isInlineContent = (
  content: DocumentContent,
): content is InlineContent => content.type === 'inline';

/**
 * Type guard for chunked content.
 */
export const isChunkedContent = (
  content: DocumentContent,
): content is ChunkedContent => content.type === 'chunked';

/**
 * Type guard for external content.
 */
export const isExternalContent = (
  content: DocumentContent,
): content is ExternalContent => content.type === 'external';
