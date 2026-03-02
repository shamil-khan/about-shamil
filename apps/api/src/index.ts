// --- FILE: apps/api/src/index.ts ---

import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import pino from 'pino';
import { pinoLogger, type PinoLogger } from 'hono-pino';
import { DocumentApi } from './api/DocumentApi';
import { SwaggerDocApi } from './api/SwaggerDocApi';
import {
  type IUnifiedRedis,
  getRedis,
  RedisDataRepository,
} from './libs/redis';

// =============================================================================
// Type Definitions
// =============================================================================

interface CloudflareBindings {
  APP_NAME: string;
  APP_VERSION: string;
  IS_DEVELOPMENT: boolean;
  REDIS_URL?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  ASSETS: Fetcher;
}

interface AppVariables {
  logger: PinoLogger;
}

type AppEnv = {
  Variables: AppVariables;
  Bindings: CloudflareBindings;
};

type AppContext = Context<AppEnv>;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Determines the appropriate Redis URL based on environment mode.
 */
function resolveRedisUrl(bindings: CloudflareBindings): string | undefined {
  return bindings.IS_DEVELOPMENT
    ? bindings.REDIS_URL
    : bindings.UPSTASH_REDIS_REST_URL;
}

/**
 * Creates a fresh Redis connection for each request.
 * This prevents stale connection issues in development mode.
 */
function createRedisConnection(
  url: string | undefined,
  token: string | undefined,
  log: PinoLogger,
): IUnifiedRedis | null {
  if (!url) {
    log.warn({}, 'Redis URL not configured');
    return null;
  }

  try {
    const redis = getRedis(url, token);
    log.debug({ url: url.slice(0, 25) + '...' }, 'Redis connection created');
    return redis;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error({ error: message }, 'Redis connection failed');
    return null;
  }
}

// =============================================================================
// Document Request Handler
// =============================================================================

/**
 * Forwards requests to the DocumentApi router.
 * Creates a fresh Redis connection and DocumentApi instance per request.
 */
async function handleDocumentRequest(
  c: AppContext,
  subPath: string,
): Promise<Response> {
  const log = c.get('logger');
  const redisUrl = resolveRedisUrl(c.env);

  // Create fresh Redis connection for this request
  const redis = createRedisConnection(
    redisUrl,
    c.env.UPSTASH_REDIS_REST_TOKEN,
    log,
  );

  if (!redis) {
    log.error({}, 'Redis unavailable for document operation');
    return c.json({ error: 'Database connection unavailable' }, 503);
  }

  // Create fresh DocumentApi instance with this connection
  const repo = new RedisDataRepository(redis);
  const documentApi = new DocumentApi(repo);

  // Normalize path
  let normalizedPath = subPath.startsWith('/') ? subPath : `/${subPath}`;
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  const url = new URL(c.req.url);
  const targetUrl = `http://localhost${normalizedPath}${url.search}`;

  log.debug(
    {
      originalUrl: url.pathname,
      targetPath: normalizedPath,
      method: c.req.method,
    },
    'Forwarding to DocumentApi',
  );

  const method = c.req.method;
  const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  const headers = new Headers();
  c.req.raw.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  let forwardRequest: Request;
  if (hasBody) {
    const bodyContent = await c.req.arrayBuffer();
    forwardRequest = new Request(targetUrl, {
      method,
      headers,
      body: bodyContent,
    });
  } else {
    forwardRequest = new Request(targetUrl, {
      method,
      headers,
    });
  }

  return documentApi.router.fetch(forwardRequest);
}

// =============================================================================
// Application Setup
// =============================================================================

const app = new Hono<AppEnv>();

const pinoInstance = pino({
  level: 'info', // Changed from default to reduce noise
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => ({ level: label.toUpperCase() }),
  },
});

// =============================================================================
// Global Middleware
// =============================================================================

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PUT'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
);

app.use('*', pinoLogger({ pino: pinoInstance }));

// =============================================================================
// Root-Level Routes
// =============================================================================

app.get('/time', (c) => {
  const time = new Date().toISOString();
  const timeStr = time.slice(11, 19);
  return c.text(
    `Hello Hono - (${c.env.APP_VERSION})! The current time is ${timeStr}`,
  );
});

app.get('/app-beat', (c) => {
  const time = new Date().toISOString();
  c.get('logger').info({ time }, 'API heartbeat check');
  return c.json({
    status: 'ok',
    timestamp: time,
    message: `API (${c.env.APP_VERSION}) is working fine! (${time.slice(11, 19)})`,
  });
});

// =============================================================================
// API Sub-Router
// =============================================================================

const api = new Hono<AppEnv>();

api.get('/info', (c) => {
  const { APP_NAME, APP_VERSION, IS_DEVELOPMENT } = c.env;
  const redisUrl = resolveRedisUrl(c.env);

  return c.json({
    name: APP_NAME,
    version: APP_VERSION,
    isDevelopment: IS_DEVELOPMENT ? 'YES' : 'NO',
    redisConfigured: redisUrl ? 'YES' : 'NO',
  });
});

const swaggerDoc = new SwaggerDocApi();
api.route('/swagger', swaggerDoc.router);

// =============================================================================
// Document API Routes
// =============================================================================

api.get('/docs', (c) => handleDocumentRequest(c, '/'));
api.post('/docs', (c) => handleDocumentRequest(c, '/'));
api.delete('/docs', (c) => handleDocumentRequest(c, '/'));

api.delete('/docs/batch', (c) => handleDocumentRequest(c, '/batch'));

api.get('/docs/user/:userId', (c) => {
  const userId = c.req.param('userId');
  return handleDocumentRequest(c, `/user/${userId}`);
});

api.get('/docs/user/:userId/meta', (c) => {
  const userId = c.req.param('userId');
  return handleDocumentRequest(c, `/user/${userId}/meta`);
});

api.delete('/docs/user/:userId', (c) => {
  const userId = c.req.param('userId');
  return handleDocumentRequest(c, `/user/${userId}`);
});

api.get('/docs/:id', (c) => {
  const id = c.req.param('id');
  return handleDocumentRequest(c, `/${id}`);
});

api.put('/docs/:id', (c) => {
  const id = c.req.param('id');
  return handleDocumentRequest(c, `/${id}`);
});

api.delete('/docs/:id', (c) => {
  const id = c.req.param('id');
  return handleDocumentRequest(c, `/${id}`);
});

app.route('/api', api);

// =============================================================================
// Static Asset Handling
// =============================================================================

app.get('*', async (c) => {
  const url = new URL(c.req.url);
  const path = url.pathname;
  const fileName = path.split('/').pop() ?? 'unknown';

  const res = await c.env.ASSETS.fetch(c.req.raw);

  if (res.status !== 404) {
    const newRes = new Response(res.body, res);
    const cacheControl = c.env.IS_DEVELOPMENT
      ? 'no-cache, no-store, must-revalidate'
      : 'public, max-age=31536000';
    newRes.headers.set('Cache-Control', cacheControl);
    return newRes;
  }

  const isStaticAsset =
    /\.(png|jpe?g|gif|svg|ico|css|js|woff2?|map|json)$/i.test(path);

  if (isStaticAsset) {
    c.get('logger').error({ path, fileName }, 'Static asset not found');
    return c.text(`Asset "${fileName}" not found`, 404);
  }

  c.get('logger').warn({ path }, 'Route not found - serving SPA fallback');
  return c.env.ASSETS.fetch(new URL('/index.html', c.req.url));
});

export default app;
