import { Document } from './Document';

/**
 * The document request used to create, update document.
 * Excludes auto-generated fields: id, createdOn, updatedOn.
 */
export type DocumentRequest = Pick<
  Document,
  'userId' | 'profileName' | 'languageCode' | 'content'
>;
