/**
 * The core and full data structure stored in Redis.
 * This is our "Single Source of Truth" for type safety.
 */
export type DataPayload = {
  id: string;
  userId: string;
  languageCode: string;
  profileName: string;
  content: string;
  fileName: string;
  timestamp: string;
};

/**
 * A subset of DataPayload for listing and indexing.
 * Prevents loading large 'content' fields into memory unnecessarily.
 */
export type DocMeta = Pick<
  DataPayload,
  'id' | 'userId' | 'profileName' | 'languageCode'
>;

/**
 * Interface for a data persistence layer managing document payloads and metadata.
 */
export interface IDataRepository {
  /**
   * Persists a new document to the store.
   * @param payload - The document data to be saved.
   * @returns A promise that resolves when the document is saved.
   */
  addDoc(payload: DataPayload): Promise<void>;

  /**
   * Retrieves a specific document by its unique identifier.
   * @param id - The unique ID of the document.
   * @returns The document payload if found, otherwise null.
   */
  getDoc(id: string): Promise<DataPayload | null>;

  /**
   * Retrieves metadata for all documents belonging to a specific user.
   * @param userId - The ID of the owner.
   * @returns A list of document metadata objects.
   */
  getUserDocMeta(userId: string): Promise<DocMeta[]>;

  /**
   * Retrieves the full payloads for all documents belonging to a specific user.
   * @param userId - The ID of the owner.
   * @returns A list of full document payloads.
   */
  getUserDocs(userId: string): Promise<DataPayload[]>;

  /**
   * Updates an existing document with a new payload.
   * @param id - The ID of the document to update.
   * @param newPayload - The new data to overwrite the existing document.
   */
  editDoc(id: string, newPayload: DataPayload): Promise<void>;

  /**
   * Deletes a single document from the store.
   * @param id - The ID of the document to remove.
   */
  deleteDoc(id: string): Promise<void>;

  /**
   * Deletes all documents associated with a specific user.
   * @param userId - The ID of the user whose documents should be removed.
   * @returns A promise resolving to an array of the deleted document IDs.
   */
  deleteUserDocs(userId: string): Promise<string[]>;

  /**
   * Performs a batch deletion of documents by their IDs.
   * @param ids - An array of document IDs to remove.
   */
  deleteDocs(ids: string[]): Promise<void>;

  /**
   * Lists metadata for every document currently in the repository.
   * @returns A list of all available document metadata.
   */
  listDocs(): Promise<DocMeta[]>;

  /**
   * Purges the entire repository, removing all documents.
   * Use with caution.
   */
  deleteAll(): Promise<void>;
}
