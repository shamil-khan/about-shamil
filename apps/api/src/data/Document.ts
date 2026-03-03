import { DocumentContent } from './DocumentContent';

/**
 * The core and full data structure stored in Redis.
 * This is our "Single Source of Truth" for type safety.
 */
export type Document = {
  /** Unique document identifier (auto-generated on creation) */
  id: string;
  /** Owner user identifier */
  userId: string;
  /** ISO language code (e.g., en, es, fr) */
  languageCode: string;
  /** Profile name for the document */
  profileName: string;
  /** Document content with storage strategy */
  content: DocumentContent;
  /** ISO timestamp when document was created (auto-generated) */
  createdOn: string;
  /** ISO timestamp when document was updated (auto-generated) */
  updatedOn?: string;
};
