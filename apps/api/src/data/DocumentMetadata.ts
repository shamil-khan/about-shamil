// --- FILE: apps/api/src/data/DocumentMetadata.ts ---

import { Document } from './Document';
import { MimeType } from './DocumentContent';

/**
 * Lightweight content metadata (excludes actual data).
 */
export type ContentMetadata = {
  /** MIME type */
  mimeType: MimeType;
  /** Original filename */
  fileName: string;
  /** Size in bytes */
  size: number;
  /** Storage type */
  storageType: 'inline' | 'chunked' | 'external';
};

/**
 * A subset of Document for listing and indexing.
 * Prevents loading large 'content' fields into memory unnecessarily.
 */
export type DocumentMetadata = {
  /** Document ID */
  id: string;
  /** Owner user identifier */
  userId: string;
  /** Profile name */
  profileName: string;
  /** Language code */
  languageCode: string;
  /** Content metadata (without actual content data) */
  contentInfo: ContentMetadata;
};

/**
 * Creates metadata from a full document.
 * @param doc - The full document
 * @returns Document metadata without content data
 */
export const toDocumentMetadata = (doc: Document): DocumentMetadata => ({
  id: doc.id,
  userId: doc.userId,
  profileName: doc.profileName,
  languageCode: doc.languageCode,
  contentInfo: {
    mimeType: doc.content.mimeType,
    fileName: doc.content.fileName,
    size:
      doc.content.type === 'inline'
        ? doc.content.size
        : doc.content.type === 'chunked'
          ? doc.content.totalSize
          : doc.content.size,
    storageType: doc.content.type,
  },
});
