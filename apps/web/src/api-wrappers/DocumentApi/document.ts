// ============================================================================
// Document API Type Definitions
// ============================================================================
// These types mirror the API data structures exactly to ensure end-to-end
// type safety. All types are strictly defined with no use of `any`.
// ============================================================================

/**
 * Supported MIME types for document content.
 * Includes standard text formats, structured data formats, and binary formats.
 */
export type MimeType =
  | 'text/plain'
  | 'text/html'
  | 'text/markdown'
  | 'application/json'
  | 'application/pdf'
  | 'application/octet-stream'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // docx
  | 'application/msword' // doc
  | 'application/x-yaml'
  | 'text/yaml'
  | string; // Allow other types for extensibility while preserving type hints

/**
 * Content encoding types for document data transmission.
 */
export type ContentEncoding = 'utf-8' | 'base64' | 'binary';

/**
 * Supported language codes for document localization.
 * Limited to the specified set: English, Urdu, Arabic, French, Dutch, Japanese.
 */
export type LanguageCode = 'en' | 'ur' | 'ar' | 'fr' | 'nl' | 'ja';

/**
 * Array of all supported language codes for iteration and validation.
 */
export const SUPPORTED_LANGUAGE_CODES: readonly LanguageCode[] = [
  'en',
  'ur',
  'ar',
  'fr',
  'nl',
  'ja',
] as const;

/**
 * Human-readable labels for language codes.
 */
export const LANGUAGE_CODE_LABELS: Readonly<Record<LanguageCode, string>> = {
  en: 'English',
  ur: 'Urdu',
  ar: 'Arabic',
  fr: 'French',
  nl: 'Dutch',
  ja: 'Japanese',
} as const;

/**
 * Maximum size for inline content storage (1MB).
 * Content exceeding this size should use chunked or external storage.
 */
export const MAX_INLINE_CONTENT_SIZE = 1024 * 1024;

// ============================================================================
// Content Storage Strategy Types
// ============================================================================

/**
 * Inline content for small files stored directly in the document.
 * Used when content size is within MAX_INLINE_CONTENT_SIZE.
 */
export type InlineContent = {
  /** Discriminant type identifier */
  readonly type: 'inline';
  /** Content data (Base64 encoded for binary, plain text for text formats) */
  readonly data: string;
  /** MIME type of the content */
  readonly mimeType: MimeType;
  /** Original filename */
  readonly fileName: string;
  /** Size in bytes */
  readonly size: number;
  /** Encoding used for the data field */
  readonly encoding: ContentEncoding;
};

/**
 * Chunked content reference for large files.
 * Content is split into multiple chunks stored separately.
 */
export type ChunkedContent = {
  /** Discriminant type identifier */
  readonly type: 'chunked';
  /** Total number of chunks */
  readonly totalChunks: number;
  /** Size of each chunk in bytes */
  readonly chunkSize: number;
  /** Total content size in bytes across all chunks */
  readonly totalSize: number;
  /** MIME type of the content */
  readonly mimeType: MimeType;
  /** Original filename */
  readonly fileName: string;
  /** SHA-256 checksum for integrity verification */
  readonly checksum: string;
  /** Redis keys for each chunk */
  readonly chunkKeys: readonly string[];
};

/**
 * External storage reference (e.g., S3, R2, GCS).
 * Content is stored outside the primary document store.
 */
export type ExternalContent = {
  /** Discriminant type identifier */
  readonly type: 'external';
  /** Storage provider identifier */
  readonly provider: 'r2' | 's3' | 'gcs';
  /** Bucket name */
  readonly bucket: string;
  /** Object key in the bucket */
  readonly key: string;
  /** MIME type of the content */
  readonly mimeType: MimeType;
  /** Original filename */
  readonly fileName: string;
  /** Size in bytes */
  readonly size: number;
  /** SHA-256 checksum for integrity verification */
  readonly checksum: string;
};

/**
 * Union type for all content storage strategies.
 * A document's content must use exactly one storage strategy.
 */
export type DocumentContent = InlineContent | ChunkedContent | ExternalContent;

// ============================================================================
// Type Guards for Content Storage Strategies
// ============================================================================

/**
 * Type guard to check if content uses inline storage.
 * @param content - The document content to check
 * @returns True if content is InlineContent, false otherwise
 */
export const isInlineContent = (
  content: DocumentContent,
): content is InlineContent => content.type === 'inline';

/**
 * Type guard to check if content uses chunked storage.
 * @param content - The document content to check
 * @returns True if content is ChunkedContent, false otherwise
 */
export const isChunkedContent = (
  content: DocumentContent,
): content is ChunkedContent => content.type === 'chunked';

/**
 * Type guard to check if content uses external storage.
 * @param content - The document content to check
 * @returns True if content is ExternalContent, false otherwise
 */
export const isExternalContent = (
  content: DocumentContent,
): content is ExternalContent => content.type === 'external';

// ============================================================================
// Core Document Types
// ============================================================================

/**
 * The core and complete data structure stored in the document store.
 * This represents the "Single Source of Truth" for document data.
 */
export type Document = {
  /** Unique document identifier (auto-generated on creation) */
  readonly id: string;
  /** Owner user identifier */
  readonly userId: string;
  /** ISO language code (e.g., en, ur, ar, fr, nl, ja) */
  readonly languageCode: LanguageCode;
  /** Profile name for the document */
  readonly profileName: string;
  /** Document content with storage strategy */
  readonly content: DocumentContent;
  /** ISO timestamp when document was created (auto-generated) */
  readonly createdOn: string;
  /** ISO timestamp when document was last updated (auto-generated, optional) */
  readonly updatedOn?: string;
};

/**
 * Lightweight content metadata (excludes actual data).
 * Used for listings where full content is not needed.
 */
export type ContentMetadata = {
  /** MIME type */
  readonly mimeType: MimeType;
  /** Original filename */
  readonly fileName: string;
  /** Size in bytes */
  readonly size: number;
  /** Storage type indicator */
  readonly storageType: 'inline' | 'chunked' | 'external';
};

/**
 * A subset of Document for listing and indexing operations.
 * Prevents loading large 'content' fields into memory unnecessarily.
 */
export type DocumentMetadata = {
  /** Document ID */
  readonly id: string;
  /** Owner user identifier */
  readonly userId: string;
  /** Profile name */
  readonly profileName: string;
  /** Language code */
  readonly languageCode: LanguageCode;
  /** Content metadata (without actual content data) */
  readonly contentInfo: ContentMetadata;
};

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Content payload for document creation/update requests.
 * This is the client-side representation of content to be sent to the API.
 */
export type ContentPayload = {
  /** Content data (Base64 encoded for binary files) */
  readonly data: string;
  /** MIME type of the content */
  readonly mimeType: MimeType;
  /** Original filename */
  readonly fileName: string;
  /** Encoding of the data field */
  readonly encoding: ContentEncoding;
};

/**
 * The document api request used to create a new document.
 */
export type DocumentApiRequest = {
  /** Profile name for the document */
  readonly profileName: string;
  /** ISO language code (e.g., en, ur, ar, fr, nl, ja) */
  readonly languageCode: LanguageCode;
  /** Content payload */
  readonly content: ContentPayload;
};

/**
 * The document response returned after creating, updating, or deleting a document.
 * Provides operation status and metadata about the affected document.
 */
export type DocumentResponse = {
  /**
   * The document ID.
   * - For creation: auto-generated document id
   * - For update: updated document id
   * - For deletion: deleted document id
   */
  readonly documentId: string;
  /**
   * The timestamp of the operation.
   * - For creation: auto-generated createdOn timestamp
   * - For update: auto-generated updatedOn timestamp
   * - For deletion: operation timestamp
   */
  readonly timestamp: string;
  /**
   * Operation status indicator.
   * True when operation succeeds, false when it fails.
   */
  readonly status: boolean;
  /**
   * Detailed information about the operation result.
   * - On success: contains document metadata
   * - On failure: contains error reason
   */
  readonly message: string;
};

/**
 * The document store reset response returned after resetting the system.
 * Indicates the result of clearing all data from the store.
 */
export type DocumentStoreResetResponse = {
  /**
   * Operation status indicator.
   * True when reset succeeds, false when it fails.
   */
  readonly status: boolean;
  /**
   * Detailed information about the reset result.
   * - On success: contains deleted document metadata summary
   * - On failure: contains error reason
   */
  readonly message: string;
};

// ============================================================================
// Utility Types for UI State Management
// ============================================================================

/**
 * Selection state for bulk operations.
 * Maps item IDs to their selected state.
 */
export type SelectionState = Readonly<Record<string, boolean>>;

/**
 * User with aggregated document information.
 * Used for displaying users with their document counts in tree views.
 */
export type UserWithDocuments = {
  /** User identifier */
  readonly userId: string;
  /** Number of documents owned by this user */
  readonly documentCount: number;
  /** Documents owned by this user (metadata only) */
  readonly documents: readonly DocumentMetadata[];
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates if a string is a supported language code.
 * @param value - The string to validate
 * @returns True if value is a valid LanguageCode, false otherwise
 */
export const isValidLanguageCode = (value: unknown): value is LanguageCode =>
  typeof value === 'string' &&
  SUPPORTED_LANGUAGE_CODES.includes(value as LanguageCode);

/**
 * Gets the human-readable label for a language code.
 * @param code - The language code
 * @returns The human-readable label, or the code itself if not found
 */
export const getLanguageLabel = (code: LanguageCode): string =>
  LANGUAGE_CODE_LABELS[code] ?? code;
