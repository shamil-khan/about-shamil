// --- FILE: apps/api/src/data/DocumentRequest.ts ---

import { MimeType, ContentEncoding } from './DocumentContent';

/**
 * Content payload for document creation/update requests.
 */
export type ContentPayload = {
  /** Content data (Base64 encoded for binary files) */
  data: string;
  /** MIME type of the content */
  mimeType: MimeType;
  /** Original filename */
  fileName: string;
  /** Encoding of the data field */
  encoding: ContentEncoding;
};

/**
 * The document request used to create or update a document.
 * Excludes auto-generated fields: id, createdOn, updatedOn.
 */
export type DocumentRequest = {
  /** Owner user identifier */
  userId: string;
  /** Profile name for the document */
  profileName: string;
  /** ISO language code (e.g., en, es, fr) */
  languageCode: string;
  /** Content payload */
  content: ContentPayload;
};
