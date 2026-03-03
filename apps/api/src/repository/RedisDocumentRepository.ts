import { IDocumentRepository } from '../repository/IDcoumentRepository';
import {
  Document,
  DocumentMetadata,
  DocumentRequest,
  DocumentResponse,
  DocumentStoreResetResponse,
} from '../data';
import { IUnifiedRedis } from '../libs';

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
   * Persists a new document to the store.
   * Auto-generates id, createdOn, and sets updatedOn to null.
   */
  async addDocument(request: DocumentRequest): Promise<DocumentResponse> {
    const id = this.generateUniqueId(); // Implement your ID generator
    const createdOn = new Date().toISOString();
    const updatedOn = null;

    const document: Document = {
      id,
      userId: request.userId,
      profileName: request.profileName,
      languageCode: request.languageCode,
      content: request.content,
      createdOn,
      updatedOn,
    };

    const metadata: DocumentMetadata = {
      id,
      userId: request.userId,
      profileName: request.profileName,
      languageCode: request.languageCode,
    };

    const primaryKey = `doc:${id}`;
    const metaKey = `meta:${id}`;
    const userIndexKey = `index:user:${request.userId}:ids`;
    const uniqueKey = `unique:user:${request.userId}:profile:${request.profileName}:lang:${request.languageCode}`;

    try {
      const existingId = await this.redis.get(uniqueKey);
      if (existingId) {
        return {
          documentId: id,
          timestamp: createdOn,
          status: false,
          message: `Document with the same userId, profileName, and languageCode already exists.`,
        };
      }

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
        timestamp: createdOn,
        status: true,
        message: `Document created successfully.`,
      };
    } catch (err: unknown) {
      throw new Error(`Redis addDocument failed: ${(err as Error).message}`);
    }
  }

  /**
   * Updates an existing document identified by id.
   * Sets updatedOn to current timestamp.
   */
  async updateDocument(
    id: string,
    request: DocumentRequest,
  ): Promise<DocumentResponse> {
    try {
      const existing = await this.getDocument(id);
      if (!existing) {
        return {
          documentId: id,
          timestamp: new Date().toISOString(),
          status: false,
          message: `Document with ID ${id} not found.`,
        };
      }

      const oldMeta = await this.getDocumentMetadata(id);
      if (!oldMeta) {
        throw new Error(`Metadata for document ${id} not found`);
      }

      const newUpdatedOn = new Date().toISOString();

      const newDoc: Document = {
        id,
        userId: request.userId,
        profileName: request.profileName,
        languageCode: request.languageCode,
        content: request.content,
        createdOn: existing.createdOn,
        updatedOn: newUpdatedOn,
      };

      const newMeta: DocumentMetadata = {
        id,
        userId: request.userId,
        profileName: request.profileName,
        languageCode: request.languageCode,
      };

      const oldUniqueKey = `unique:user:${oldMeta.userId}:profile:${oldMeta.profileName}:lang:${oldMeta.languageCode}`;
      const newUniqueKey = `unique:user:${request.userId}:profile:${request.profileName}:lang:${request.languageCode}`;

      if (oldUniqueKey !== newUniqueKey) {
        const conflictId = await this.redis.get(newUniqueKey);
        if (conflictId && conflictId !== id) {
          return {
            documentId: id,
            timestamp: newUpdatedOn,
            status: false,
            message: `Duplicate key exists for the given userId, profileName, and languageCode.`,
          };
        }
      }

      await Promise.all([
        this.redis.set(`doc:${id}`, JSON.stringify(newDoc)),
        this.redis.set(`meta:${id}`, JSON.stringify(newMeta)),
        this.redis.set(
          `unique:user:${request.userId}:profile:${request.profileName}:lang:${request.languageCode}`,
          id,
        ),
      ]);

      if (oldMeta.userId !== request.userId) {
        await Promise.all([
          this.redis.srem(`index:user:${oldMeta.userId}:ids`, id),
          this.redis.sadd(`index:user:${request.userId}:ids`, id),
        ]);
      }

      if (oldUniqueKey !== newUniqueKey) {
        await Promise.all([
          this.redis.del(oldUniqueKey),
          this.redis.set(newUniqueKey, id),
        ]);
      }

      return {
        documentId: id,
        timestamp: newUpdatedOn,
        status: true,
        message: `Document updated successfully.`,
      };
    } catch (err: unknown) {
      throw new Error(`Redis updateDocument failed: ${(err as Error).message}`);
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

      const uniqueKey = `unique:user:${meta.userId}:profile:${meta.profileName}:lang:${meta.languageCode}`;
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
