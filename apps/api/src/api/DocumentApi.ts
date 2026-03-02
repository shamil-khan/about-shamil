import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { IDataRepository, DataPayload, DocMeta } from '../models/types';

/**
 * Controller class mapping IDataRepository to Hono routes with strict validation.
 */
export class DocumentApi {
  public readonly router: Hono;
  private readonly repo: IDataRepository;

  constructor(repo: IDataRepository) {
    this.repo = repo;
    this.router = new Hono();
    this.setupRoutes();
  }

  /**
   * Validates that the primary identity fields are present.
   * Ensures prelim checks for userId, profileName, and languageCode.
   */
  private validateIdentity(payload: Partial<DataPayload>): void {
    const { userId, profileName, languageCode } = payload;
    if (!userId || !profileName || !languageCode) {
      throw new HTTPException(400, {
        message:
          'Missing identity fields: userId, profileName, and languageCode are required.',
      });
    }
  }

  private setupRoutes(): void {
    this.router
      // GET /doc -> listDocs()
      .get('/', async (c) => {
        const metadata: DocMeta[] = await this.repo.listDocs();
        return c.json(metadata);
      })
      // POST /doc -> addDoc()
      .post('/', async (c) => {
        const payload = await c.req.json<DataPayload>();
        this.validateIdentity(payload);
        await this.repo.addDoc(payload);
        return c.json({ success: true }, 201);
      })
      // DELETE /doc -> deleteAll()
      .delete('/', async (c) => {
        await this.repo.deleteAll();
        return c.json({ success: true });
      })
      // DELETE /doc/batch -> deleteDocs()
      .delete('/batch', async (c) => {
        const { ids } = await c.req.json<{ ids: string[] }>();
        if (!ids || !Array.isArray(ids)) {
          throw new HTTPException(400, {
            message: 'Invalid or missing IDs array',
          });
        }
        await this.repo.deleteDocs(ids);
        return c.json({ success: true });
      })
      // GET /doc/user/:userId -> getUserDocs()
      .get('/user/:userId', async (c) => {
        const userId = c.req.param('userId');
        const docs: DataPayload[] = await this.repo.getUserDocs(userId);
        return c.json(docs);
      })
      // GET /doc/user/:userId/meta -> getUserDocMeta()
      .get('/user/:userId/meta', async (c) => {
        const userId = c.req.param('userId');
        const meta: DocMeta[] = await this.repo.getUserDocMeta(userId);
        return c.json(meta);
      })
      // DELETE /doc/user/:userId -> deleteUserDocs()
      .delete('/user/:userId', async (c) => {
        const userId = c.req.param('userId');
        const deletedIds: string[] = await this.repo.deleteUserDocs(userId);
        return c.json({ deletedIds });
      })
      // GET /doc/:id -> getDoc()
      .get('/:id', async (c) => {
        const id = c.req.param('id');
        const doc: DataPayload | null = await this.repo.getDoc(id);
        if (!doc) return c.json({ error: 'Document not found' }, 404);
        return c.json(doc);
      })
      // PUT /doc/:id -> editDoc()
      .put('/:id', async (c) => {
        const id = c.req.param('id');
        const payload = await c.req.json<DataPayload>();
        this.validateIdentity(payload);
        await this.repo.editDoc(id, payload);
        return c.json({ success: true });
      })
      // DELETE /doc/:id -> deleteDoc()
      .delete('/:id', async (c) => {
        const id = c.req.param('id');
        await this.repo.deleteDoc(id);
        return c.json({ success: true });
      });
  }
}
