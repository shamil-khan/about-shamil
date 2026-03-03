import { Document } from './Document';

/**
 * A subset of Document for listing and indexing.
 * Prevents loading large 'content' fields into memory unnecessarily.
 */
export type DocumentMetadata = Pick<
  Document,
  'id' | 'userId' | 'profileName' | 'languageCode'
>;
