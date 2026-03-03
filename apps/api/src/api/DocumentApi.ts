import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import {
  Document,
  DocumentMetadata,
  DocumentRequest,
  DocumentResponse,
  DocumentStoreResetResponse,
} from '../data';
import { IDocumentRepository } from '../repository/IDcoumentRepository';
import { RedisDocumentRepository } from '../repository';
import { AppContext, AppEnv } from '../AppContext';
import { IUnifiedRedis } from '../libs';

/**
 * REST API controller for document management operations.
 * Provides endpoints for CRUD operations on documents, user management,
 * batch operations, and system administration.
 *
 * @remarks
 * Route registration order is critical in Hono - static routes MUST be
 * registered before parameterized routes to avoid path conflicts.
 */
export class DocumentApi {
  /** Hono router instance for defining routes */
  public readonly router: Hono<AppEnv>;

  /**
   * Constructs a new DocumentApi instance and registers all routes.
   */
  constructor() {
    this.router = new Hono<AppEnv>();
    this.registerRoutes();
  }

  /**
   * Creates a repository instance from the request context.
   * @param c - The Hono application context
   * @returns An IDocumentRepository implementation
   */
  private getRepository = (c: AppContext): IDocumentRepository =>
    new RedisDocumentRepository(c.get('redis'));

  private getRepository_logger = (c: AppContext): IDocumentRepository => {
    const log = c.get('logger');
    const redis: IUnifiedRedis = c.get('redis');

    if (!redis) {
      log.error('Redis is not accessible');
      throw new Error('Redis is not accessible');
    }

    const repo = new RedisDocumentRepository(redis);

    if (!repo) {
      log.error('Repository is not accessible');
      throw new Error('Repository is not accessible');
    }

    return repo;
  };

  /**
   * Validates that the essential identity fields are present in the request.
   * @param request - Partial Document containing identity fields
   * @throws HTTPException with 400 status if validation fails
   */
  private validateIdentity(request: Partial<Document>): void {
    const { userId, profileName, languageCode } = request;
    if (!userId || !profileName || !languageCode) {
      throw new HTTPException(400, {
        message:
          'Missing required identity fields: userId, profileName, and languageCode.',
      });
    }
  }

  /**
   * Validates that the request body contains a valid array of IDs.
   * @param ids - The IDs array from request body
   * @throws HTTPException with 400 status if validation fails
   */
  private validateIdsArray(ids: unknown): asserts ids is string[] {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new HTTPException(400, {
        message:
          'Invalid or missing IDs array. Expected non-empty string array.',
      });
    }
    if (!ids.every((id): id is string => typeof id === 'string')) {
      throw new HTTPException(400, {
        message: 'Invalid IDs array. All elements must be strings.',
      });
    }
  }

  /**
   * Registers all API routes.
   *
   * @remarks
   * IMPORTANT: Route registration order matters in Hono!
   * Static routes (e.g., /users, /batch-documents, /reset-store)
   * MUST be registered BEFORE parameterized routes (e.g., /:id, /user/:userId)
   * to prevent the parameterized routes from capturing static path segments.
   */
  private registerRoutes = (): void => {
    // =========================================================================
    // ROOT ROUTES: / (GET, POST)
    // =========================================================================

    /**
     * GET /
     * Lists all documents metadata in the system.
     * Returns lightweight metadata (excludes content) for memory efficiency.
     */
    this.router.get('/', async (c) => {
      const metadatas: DocumentMetadata[] =
        await this.getRepository(c).allDocuments();
      return c.json(metadatas);
    });

    /**
     * POST /
     * Creates a new document.
     * Requires: userId, profileName, languageCode, content
     * Auto-generates: id, createdOn
     */
    this.router.post('/', async (c) => {
      const request = await c.req.json<DocumentRequest>();
      this.validateIdentity(request);
      const response = await this.getRepository(c).addDocument(request);
      return c.json(response, 201);
    });

    // =========================================================================
    // STATIC ROUTES (MUST be before parameterized routes)
    // =========================================================================

    /**
     * GET /users
     * Lists all user IDs in the system.
     */
    this.router.get('/users', async (c) => {
      const ids: string[] = await this.getRepository(c).allUsers();
      return c.json(ids);
    });

    /**
     * DELETE /batch-documents
     * Deletes multiple documents by their IDs.
     * Request body: { ids: string[] }
     */
    this.router.delete('/batch-documents', async (c) => {
      const body = await c.req.json<{ ids: unknown }>();
      this.validateIdsArray(body.ids);
      const response: DocumentResponse[] = await this.getRepository(
        c,
      ).deleteDocuments(body.ids);
      return c.json(response);
    });

    /**
     * DELETE /reset-store
     * Resets the entire document store.
     * Deletes all documents, metadata, users, and indexes.
     * USE WITH CAUTION: This operation cannot be undone.
     */
    this.router.delete('/reset-store', async (c) => {
      const response: DocumentStoreResetResponse =
        await this.getRepository(c).resetStore();
      return c.json(response);
    });

    // =========================================================================
    // USER STATIC ROUTES (MUST be before /user/:userId)
    // =========================================================================

    /**
     * DELETE /user/batch-users
     * Deletes multiple users and all their associated documents.
     * Request body: { ids: string[] }
     */
    this.router.delete('/batch-users', async (c) => {
      const body = await c.req.json<{ ids: unknown }>();
      this.validateIdsArray(body.ids);
      const response: DocumentResponse[] = await this.getRepository(
        c,
      ).deleteUsers(body.ids);
      return c.json(response);
    });

    // =========================================================================
    // USER PARAMETERIZED ROUTES: /user/:userId
    // =========================================================================

    /**
     * GET /user/:userId
     * Retrieves all documents (including content) for a specific user.
     */
    this.router.get('/user/:userId', async (c) => {
      const userId = c.req.param('userId');
      const documents: Document[] =
        await this.getRepository(c).getUserDocuments(userId);
      return c.json(documents);
    });

    /**
     * GET /user/:userId/metadata
     * Retrieves metadata for all documents belonging to a user.
     * Excludes content for memory efficiency.
     */
    this.router.get('/user/:userId/metadata', async (c) => {
      const userId = c.req.param('userId');
      const metadatas: DocumentMetadata[] =
        await this.getRepository(c).getUserDocumentsMetadata(userId);
      return c.json(metadatas);
    });

    /**
     * DELETE /user/:userId
     * Deletes a user and all their associated documents.
     */
    this.router.delete('/user/:userId', async (c) => {
      const userId = c.req.param('userId');
      const response: DocumentResponse[] =
        await this.getRepository(c).deleteUser(userId);
      return c.json(response);
    });

    // =========================================================================
    // DOCUMENT PARAMETERIZED ROUTES: /:id (MUST be LAST)
    // =========================================================================

    /**
     * GET /:id/metadata
     * Retrieves metadata for a specific document (excludes content).
     * Note: This must be before /:id to match correctly.
     */
    this.router.get('/:id/metadata', async (c) => {
      const id = c.req.param('id');
      const metadata: DocumentMetadata | null =
        await this.getRepository(c).getDocumentMetadata(id);
      if (!metadata) {
        return c.json({ error: 'Document not found' }, 404);
      }
      return c.json(metadata);
    });

    /**
     * GET /:id
     * Retrieves a specific document by ID, including its content.
     */
    this.router.get('/:id', async (c) => {
      const id = c.req.param('id');
      const document: Document | null =
        await this.getRepository(c).getDocument(id);
      if (!document) {
        return c.json({ error: 'Document not found' }, 404);
      }
      return c.json(document);
    });

    /**
     * PUT /:id
     * Updates an existing document.
     * Requires: userId, profileName, languageCode, content
     * Auto-generates: updatedOn
     */
    this.router.put('/:id', async (c) => {
      const id = c.req.param('id');
      const request = await c.req.json<DocumentRequest>();
      this.validateIdentity(request);
      const response = await this.getRepository(c).updateDocument(id, request);
      return c.json(response);
    });

    /**
     * DELETE /:id
     * Deletes a specific document by ID.
     */
    this.router.delete('/:id', async (c) => {
      const id = c.req.param('id');
      const response = await this.getRepository(c).deleteDocument(id);
      return c.json(response);
    });
  };
}
