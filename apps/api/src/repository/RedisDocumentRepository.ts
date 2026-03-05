import { IDocumentRepository } from './IDocumentRepository';
import {
  ContentPayload,
  Document,
  DocumentMetadata,
  DocumentRequest,
  DocumentResponse,
  DocumentStoreResetResponse,
} from '../data';
import { ContentService } from '../services';
import { IUnifiedRedis } from '../libs';
import { toDocumentMetadata } from '../data/DocumentMetadata';

/**
 * Redis implementation of the IDocumentRepository interface.
 * Handles all document and metadata operations with Redis.
 * @inheritDoc IDataRepository
 */
export class RedisDocumentRepository implements IDocumentRepository {
  private readonly USER_INDEX_KEY = 'index:all_users';
  private readonly GLOBAL_DOC_INDEX_KEY = 'index:all_docs:ids';

  constructor(private readonly redis: IUnifiedRedis) {}

  /**
   * Builds the unique constraint key for identity lookups.
   * @param userId - Owner user identifier
   * @param profileName - Profile name for the document
   * @param languageCode - ISO language code
   * @returns The Redis key for the unique constraint
   */
  private buildUniqueKey = (
    userId: string,
    profileName: string,
    languageCode: string,
  ): string =>
    `unique:user:${userId}:profile:${profileName}:lang:${languageCode}`;

  /**
   * Persists a new document to the store.
   * Auto-generates id, createdOn, and sets updatedOn to null.
   */
  async addDocument(request: DocumentRequest): Promise<DocumentResponse> {
    const timestamp = new Date().toISOString();
    const uniqueKey = this.buildUniqueKey(
      request.userId,
      request.profileName,
      request.languageCode,
    );

    try {
      const existingId = await this.redis.get(uniqueKey);
      if (existingId) {
        return {
          documentId: existingId,
          timestamp: timestamp,
          status: false,
          message: `Document with the same userId, profileName, and languageCode already exists.`,
        };
      }

      const id = this.generateUniqueId(); // Implement your ID generator

      const document: Document = {
        id,
        userId: request.userId,
        profileName: request.profileName,
        languageCode: request.languageCode,
        content: ContentService.toDocumentContent(request.content),
        createdOn: timestamp,
      };
      const metadata: DocumentMetadata = toDocumentMetadata(document);

      const primaryKey = `doc:${id}`;
      const metaKey = `meta:${id}`;
      const userIndexKey = `index:user:${request.userId}:ids`;

      await Promise.all([
        this.redis.set(primaryKey, JSON.stringify(document)),
        this.redis.set(metaKey, JSON.stringify(metadata)),
        this.redis.set(uniqueKey, id),
        this.redis.sadd(userIndexKey, id),
        this.redis.sadd(this.GLOBAL_DOC_INDEX_KEY, id),
        this.redis.sadd(this.USER_INDEX_KEY, request.userId),
      ]);

      return {
        documentId: id,
        timestamp: timestamp,
        status: true,
        message: `Document created successfully.`,
      };
    } catch (err: unknown) {
      throw new Error(`Redis addDocument failed: ${(err as Error).message}`);
    }
  }

  /**
   * Updates an existing document content.
   * Identity fields are immutable after creation.
   * @param id - The document ID to update
   * @param content - The update new content
   * @returns DocumentResponse indicating success or failure
   * @throws Error if Redis operation fails
   */
  async updateContent(
    id: string,
    content: ContentPayload,
  ): Promise<DocumentResponse> {
    const timestamp = new Date().toISOString();

    try {
      const existing = await this.getDocument(id);
      if (!existing) {
        return {
          documentId: id,
          timestamp,
          status: false,
          message: `Document with ID ${id} not found.`,
        };
      }

      const documentContent = ContentService.toDocumentContent(content);

      const updatedDocument: Document = {
        id,
        userId: existing.userId,
        profileName: existing.profileName,
        languageCode: existing.languageCode,
        content: documentContent,
        createdOn: existing.createdOn,
        updatedOn: timestamp,
      };

      await this.redis.set(`doc:${id}`, JSON.stringify(updatedDocument));

      return {
        documentId: id,
        timestamp,
        status: true,
        message: 'Document content updated successfully.',
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`Redis updateDocument failed: ${errorMessage}`);
    }
  }

  /**
   * Deletes a document and its metadata.
   */
  async deleteDocument(documentId: string): Promise<DocumentResponse> {
    try {
      const document = await this.getDocument(documentId);
      if (!document) {
        return {
          documentId,
          timestamp: new Date().toISOString(),
          status: false,
          message: `Document with ID ${documentId} not found.`,
        };
      }

      const meta = await this.getDocumentMetadata(documentId);
      if (!meta) {
        throw new Error(`Metadata for document ${documentId} not found`);
      }

      const uniqueKey = this.buildUniqueKey(
        meta.userId,
        meta.profileName,
        meta.languageCode,
      );

      const indexKey = `index:user:${meta.userId}:ids`;
      const timestamp = new Date().toISOString();

      await Promise.all([
        this.redis.del(`doc:${documentId}`),
        this.redis.del(`meta:${documentId}`),
        this.redis.del(uniqueKey),
        this.redis.srem(indexKey, documentId),
        this.redis.srem(this.GLOBAL_DOC_INDEX_KEY, documentId),
      ]);

      // Remove user index if no more documents
      const remaining = await this.redis.smembers(indexKey);
      if (remaining.length === 0) {
        await this.deleteUser(meta.userId);
      }

      return {
        documentId,
        timestamp,
        status: true,
        message: `Document deleted successfully.`,
      };
    } catch (err: unknown) {
      throw new Error(`Redis deleteDocument failed: ${(err as Error).message}`);
    }
  }

  /**
   * Batch deletes documents by their IDs.
   */
  async deleteDocuments(documentIds: string[]): Promise<DocumentResponse[]> {
    const responses: DocumentResponse[] = [];
    for (const id of documentIds) {
      responses.push(await this.deleteDocument(id));
    }
    return responses;
  }

  /**
   * Deletes a user and all associated documents.
   */
  async deleteUser(userId: string): Promise<DocumentResponse[]> {
    const userDocsIds = await this.redis.smembers(`index:user:${userId}:ids`);
    const responses = await this.deleteDocuments(userDocsIds);
    await this.redis.srem(this.USER_INDEX_KEY, userId);
    return responses;
  }

  /**
   * Batch deletes multiple users by their IDs.
   */
  async deleteUsers(userIds: string[]): Promise<DocumentResponse[]> {
    const allResponses: DocumentResponse[] = [];
    for (const userId of userIds) {
      const responses = await this.deleteUser(userId);
      allResponses.push(...responses);
    }
    return allResponses;
  }

  /**
   * Retrieves a document by its identity (secondary key).
   * @param userId - Owner user identifier
   * @param profileName - Profile name for the document
   * @param languageCode - ISO language code
   * @returns The document if found, null otherwise
   */
  async getDocumentByIdentity(
    userId: string,
    profileName: string,
    languageCode: string,
  ): Promise<Document | null> {
    const uniqueKey = this.buildUniqueKey(userId, profileName, languageCode);

    // Lookup document ID from identity index
    const documentId = await this.redis.get(uniqueKey);

    if (!documentId) {
      return null;
    }

    // Fetch full document using primary key
    return this.getDocument(documentId);
  }
  /**
   * Retrieves a document by its ID.
   */
  async getDocument(id: string): Promise<Document | null> {
    try {
      const data = await this.redis.get(`doc:${id}`);
      if (!data) return null;
      return JSON.parse(data) as Document;
    } catch (err: unknown) {
      throw new Error(`Redis getDocument failed: ${(err as Error).message}`);
    }
  }

  /**
   * Retrieves metadata for a document by its ID.
   */
  async getDocumentMetadata(id: string): Promise<DocumentMetadata | null> {
    try {
      const data = await this.redis.get(`meta:${id}`);
      if (!data) return null;
      return JSON.parse(data) as DocumentMetadata;
    } catch (err: unknown) {
      throw new Error(
        `Redis getDocumentMetadata failed: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Retrieves all documents for a specific user.
   */
  async getUserDocuments(userId: string): Promise<Document[]> {
    const indexKey = `index:user:${userId}:ids`;
    try {
      const ids = await this.redis.smembers(indexKey);
      const documents: Document[] = [];
      for (const id of ids) {
        const doc = await this.getDocument(id);
        if (doc) {
          documents.push(doc);
        }
      }
      return documents;
    } catch (err: unknown) {
      throw new Error(
        `Redis getUserDocuments failed: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Retrieves metadata for all documents belonging to a user.
   */
  async getUserDocumentsMetadata(userId: string): Promise<DocumentMetadata[]> {
    const indexKey = `index:user:${userId}:ids`;
    try {
      const ids = await this.redis.smembers(indexKey);
      const metadataList: DocumentMetadata[] = [];
      for (const id of ids) {
        const meta = await this.getDocumentMetadata(id);
        if (meta) {
          metadataList.push(meta);
        }
      }
      return metadataList;
    } catch (err: unknown) {
      throw new Error(
        `Redis getUserDocumentsMetadata failed: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Retrieves a list of all document metadata.
   */
  async allDocuments(): Promise<DocumentMetadata[]> {
    try {
      const allIds = await this.redis.smembers(this.GLOBAL_DOC_INDEX_KEY);
      const metadataList: DocumentMetadata[] = [];
      for (const id of allIds) {
        const meta = await this.getDocumentMetadata(id);
        if (meta) {
          metadataList.push(meta);
        }
      }
      return metadataList;
    } catch (err: unknown) {
      throw new Error(`Redis allDocuments failed: ${(err as Error).message}`);
    }
  }

  /**
   * Retrieves a list of all user IDs.
   */
  async allUsers(): Promise<string[]> {
    try {
      const users = await this.redis.smembers(this.USER_INDEX_KEY);
      return users;
    } catch (err: unknown) {
      throw new Error(`Redis allUsers failed: ${(err as Error).message}`);
    }
  }

  /**
   * Resets the store by deleting all documents and indexes.
   */
  async resetStore(): Promise<DocumentStoreResetResponse> {
    try {
      const allIds = await this.redis.smembers(this.GLOBAL_DOC_INDEX_KEY);
      const responses: DocumentResponse[] = await this.deleteDocuments(allIds);
      await this.redis.del(this.GLOBAL_DOC_INDEX_KEY);
      await this.redis.del(this.USER_INDEX_KEY);
      console.log('Reset deleted responses', responses);
      return {
        status: true,
        message: `Store reset successfully. Deleted ${allIds.length} documents.`,
      };
    } catch (err: unknown) {
      return {
        status: false,
        message: `Failed to reset store: ${(err as Error).message}`,
      };
    }
  }

  /**
   * Helper method to generate unique IDs.
   */
  private generateUniqueId(): string {
    // Implement your preferred ID generator, e.g., UUID
    return crypto.randomUUID(); // For Node.js v14+ with crypto
  }
}
