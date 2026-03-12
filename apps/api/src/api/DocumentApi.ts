import { Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import {
  ContentPayload,
  Document,
  DocumentApiRequest,
  DocumentMetadata,
  DocumentResponse,
  DocumentStoreResetResponse,
} from '../data';
import { IDocumentRepository } from '../repository/IDocumentRepository';
import { RedisDocumentRepository } from '../repository';
import { AppContext, AppEnv } from '../AppContext';
import { IUnifiedRedis } from '../libs';

// todo need to implement authentication and authorization for its hard-coded.
type ROLE = 'GUEST' | 'USER_ADMIN' | 'SYSTEM_ADMIN';
interface AppUser {
  userId: string;
  roles: ROLE[];
}

const availableUser = {
  guestUser: { userId: 'guest-user', roles: ['GUEST'] },
  userAdmin: { userId: 'uadmin-user', roles: ['USER_ADMIN'] },
  systemAdmin: { userId: 'sadmin-user', roles: ['SYSTEM_ADMIN'] },
  testUser: { userId: 'test-user', roles: ['USER_ADMIN', 'SYSTEM_ADMIN'] },
  testUser1: { userId: 'test-user-1', roles: ['USER_ADMIN', 'SYSTEM_ADMIN'] },
} satisfies Record<string, AppUser>;

const DEFAULT_PROFILE_NAME = 'default';
const DEFAULT_LANGUAGE_CODE = 'en';

class Authorization {
  constructor(
    private c: Context<AppEnv>,
    private user: AppUser,
  ) {}

  public loggedIn(): this {
    if (
      !(
        this.user.roles.includes('SYSTEM_ADMIN') ||
        this.user.roles.includes('USER_ADMIN')
      )
    ) {
      throw new HTTPException(403, {
        message: 'Forbidden',
      });
    }
    return this;
  }

  public allowAccess<T extends { userId: string }>(item: T | null): boolean {
    if (this.user.roles.includes('SYSTEM_ADMIN')) return true;

    if (
      this.user.roles.includes('USER_ADMIN') &&
      item &&
      item.userId === this.user.userId
    )
      return true;

    throw new HTTPException(403, {
      message: 'Forbidden',
    });
  }

  public allowSystemAdmin(): boolean {
    if (!this.user.roles.includes('SYSTEM_ADMIN')) {
      throw new HTTPException(403, {
        message: 'Forbidden',
      });
    }
    return true;
  }

  public param(name: string): string {
    const paramValue = this.c.req.query(name);
    if (!paramValue) {
      throw new HTTPException(404, {
        message: 'Resouces not provided',
      });
    }
    return paramValue;
  }

  public getUserId = () => this.user.userId;

  public static auth(c: Context<AppEnv>) {
    return new Authorization(c, availableUser['testUser1']);
  }
}
export class DocumentApi {
  public readonly router: Hono<AppEnv>;

  constructor() {
    this.router = new Hono<AppEnv>();
    this.registerRoutes();
  }

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

  private registerRoutes = (): void => {
    this.router.get('/default', async (c) => {
      const query = c.req.query();
      const userId = query['user-id'];

      if (!userId) {
        return c.json(
          {
            error: 'user-id is not provided',
          },
          400,
        );
      }
      const languageCode = query['language-code'];
      const finalLanguageCode = languageCode ?? DEFAULT_LANGUAGE_CODE;

      let document: Document | null = await this.getRepository(
        c,
      ).getDefaultDocument(userId, DEFAULT_PROFILE_NAME, finalLanguageCode);

      if (document) {
        return c.json(document);
      }

      if (finalLanguageCode !== DEFAULT_LANGUAGE_CODE) {
        document = await this.getRepository(c).getDefaultDocument(
          userId,
          DEFAULT_PROFILE_NAME,
          DEFAULT_LANGUAGE_CODE,
        );
      }

      if (document) {
        return c.json(document);
      }

      return c.json(
        {
          error: 'Document not found',
          userId,
          languageCode: finalLanguageCode,
        },
        404,
      );
    });

    this.router.get('/', async (c) => {
      const auth = Authorization.auth(c).loggedIn();
      const query = c.req.query();

      const userId = query['user-id'];
      if (userId && auth.allowAccess({ userId })) {
        const docs: Document[] =
          await this.getRepository(c).getUserDocuments(userId);
        return c.json(docs);
      }

      const docId = query['doc-id'];
      if (docId) {
        const doc: Document | null =
          await this.getRepository(c).getDocument(docId);
        auth.allowAccess(doc);
        return c.json(doc);
      }

      throw new HTTPException(404, { message: 'Resource not found' });
    });

    this.router.post('/', async (c) => {
      const auth = Authorization.auth(c).loggedIn();

      const apiRequest = await c.req.json<DocumentApiRequest>();
      const { profileName, languageCode } = apiRequest;
      if (!profileName || !languageCode) {
        throw new HTTPException(400, {
          message:
            'Missing required identity fields: profileName, and languageCode.',
        });
      }

      const response: DocumentResponse = await this.getRepository(
        c,
      ).addDocument(
        auth.getUserId(),
        apiRequest.profileName,
        apiRequest.languageCode,
        apiRequest.content,
      );
      return c.json(response, 201);
    });

    this.router.put('/', async (c) => {
      const auth = Authorization.auth(c).loggedIn();
      const docId = auth.param('doc-id');
      const metadata = await this.getRepository(c).getDocumentMetadata(docId);

      if (!metadata) {
        throw new HTTPException(404, {
          message: 'Document does not exists',
        });
      }
      auth.allowAccess(metadata);

      const content = await c.req.json<ContentPayload>();
      const response: DocumentResponse = await this.getRepository(
        c,
      ).updateContent(docId, content);
      return c.json(response);
    });

    this.router.delete('/', async (c) => {
      const auth = Authorization.auth(c).loggedIn();
      const docId = auth.param('doc-id');
      const metadata = await this.getRepository(c).getDocumentMetadata(docId);

      if (!metadata) {
        throw new HTTPException(404, {
          message: 'Document does not exists',
        });
      }
      auth.allowAccess(metadata);

      const response: DocumentResponse =
        await this.getRepository(c).deleteDocument(docId);
      return c.json(response);
    });

    this.router.get('/metadata', async (c) => {
      const auth = Authorization.auth(c).loggedIn();
      const query = c.req.query();

      if (Object.keys(query).length === 0 && auth.allowSystemAdmin()) {
        const metadocs: DocumentMetadata[] =
          await this.getRepository(c).allDocuments();
        return c.json(metadocs);
      }

      const userId = query['user-id'];
      if (userId && auth.allowAccess({ userId })) {
        const metaDoc: DocumentMetadata[] = await this.getRepository(
          c,
        ).getUserDocumentsMetadata(query['user-id']);
        return c.json(metaDoc);
      }

      const docId = query['doc-id'];
      if (docId) {
        const metaDoc: DocumentMetadata | null =
          await this.getRepository(c).getDocumentMetadata(docId);
        auth.allowAccess(metaDoc);
        return c.json(metaDoc);
      }

      throw new HTTPException(404, { message: 'Resource not found' });
    });

    this.router.get('/users', async (c) => {
      Authorization.auth(c).loggedIn().allowSystemAdmin();

      const ids: string[] = await this.getRepository(c).allUsers();
      return c.json(ids);
    });

    this.router.delete('/users', async (c) => {
      const auth = Authorization.auth(c).loggedIn();
      auth.allowSystemAdmin();

      const userId = auth.param('user-id');
      const response: DocumentResponse[] =
        await this.getRepository(c).deleteUser(userId);
      return c.json(response);
    });

    this.router.delete('/batch-documents', async (c) => {
      Authorization.auth(c).loggedIn().allowSystemAdmin();

      const body = await c.req.json<{ ids: unknown }>();
      this.validateIdsArray(body.ids);
      const response: DocumentResponse[] = await this.getRepository(
        c,
      ).deleteDocuments(body.ids);
      return c.json(response);
    });

    this.router.delete('/batch-users', async (c) => {
      Authorization.auth(c).loggedIn().allowSystemAdmin();

      const body = await c.req.json<{ ids: unknown }>();
      this.validateIdsArray(body.ids);
      const response: DocumentResponse[] = await this.getRepository(
        c,
      ).deleteUsers(body.ids);
      return c.json(response);
    });

    this.router.delete('/reset-store', async (c) => {
      Authorization.auth(c).loggedIn().allowSystemAdmin();

      const response: DocumentStoreResetResponse =
        await this.getRepository(c).resetStore();
      return c.json(response);
    });
  };
}
