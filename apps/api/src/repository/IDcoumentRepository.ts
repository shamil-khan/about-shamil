import {
  Document,
  DocumentMetadata,
  DocumentRequest,
  DocumentResponse,
  DocumentStoreResetResponse,
} from '../data';

/**
 * Interface for a data persistence layer managing document and document metadata.
 */
export interface IDocumentRepository {
  /**
   * Persists a new document to the store.
   * Auto-generates id and createdOn fields.
   * @param request - The request @DocumentRequest contains document data to be saved with auto-generated id/createdOn.
   * @returns A promise resolving to document response check @DocumentResponse .
   */
  addDocument(request: DocumentRequest): Promise<DocumentResponse>;

  /**
   * Updates an existing document.
   * Auto-sets the updatedOn timestamp.
   * @param id - The ID of the document to update.
   * @param request - The request @DocumentRequest contains document data to be saved with auto-generated updatedOn.
   * @returns A promise resolving to document response check @DocumentResponse .
   */
  updateDocument(
    id: string,
    request: DocumentRequest,
  ): Promise<DocumentResponse>;

  /**
   * Deletes a single document from the store, in-case if a user has no more documents in the system it is also deleted.
   * @param documentId - The ID of the document to remove.
   * @returns A promise resolving to document response check @DocumentResponse .
   */
  deleteDocument(documentId: string): Promise<DocumentResponse>;

  /**
   * Performs a batch deletion of documents by their IDs, in-case if a user has no more documents in the system it is also deleted.
   * @param documentIds - An array of document IDs to remove.
   * @returns A promise resolving to an array of @DocumentResponse which request to deleted.
   */
  deleteDocuments(documentIds: string[]): Promise<DocumentResponse[]>;

  /**
   * Deletes a user and all their documents.
   * @param userId User ID.
   * @returns A promise resolving to an array of @DocumentResponse related to that user's documents.
   */
  deleteUser(userId: string): Promise<DocumentResponse[]>;

  /**
   * Performs a batch deletion of users by their IDs.
   * @param userIds - An array of user IDs to remove.
   * @returns A promise resolving to an array of @DocumentResponse related to each user's document deleted.
   */
  deleteUsers(userIds: string[]): Promise<DocumentResponse[]>;

  /**
   * Retrieves a specific document by its unique identifier.
   * @param id - The unique ID of the document.
   * @returns A promise resolving to the document if found, otherwise null.
   */
  getDocument(id: string): Promise<Document | null>;

  /**
   * Retrieves a specific document metadata by its unique identifier.
   * @param id - The unique ID of the document.
   * @returns A promise resolving to the document metadata if found, otherwise null.
   */
  getDocumentMetadata(id: string): Promise<DocumentMetadata | null>;

  /**
   * Retrieves all documents belonging to a specific user.
   * @param userId - The ID of the owner.
   * @returns A promise resolving to an array of document objects.
   */
  getUserDocuments(userId: string): Promise<Document[]>;

  /**
   * Retrieves metadata for all documents belonging to a specific user.
   * @param userId - The ID of the owner.
   * @returns A promise resolving to an array of document metadata objects.
   */
  getUserDocumentsMetadata(userId: string): Promise<DocumentMetadata[]>;

  /**
   * Retrieves a list of metadata for every document currently in the system.
   * @returns A promise resolving to an array of all available document metadata.
   */
  allDocuments(): Promise<DocumentMetadata[]>;

  /**
   * Retrieves a list of all unique user IDs in the system.
   * @returns A promise resolving to an array of user IDs.
   */
  allUsers(): Promise<string[]>;

  /**
   * Reset entire repository by removing all documents, documents metadata and all indexes.
   * Use with caution.
   * @returns A promise resolving to @DocumentStoreResetResponse response  .
   */
  resetStore(): Promise<DocumentStoreResetResponse>;
}
