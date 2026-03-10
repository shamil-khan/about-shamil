import pino from 'pino';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { pinoLogger } from 'hono-pino';
import { AppEnv } from './AppContext';
import { AppApi } from './api';

class App {
  pinoInstance = pino({
    level: 'info', // Changed from default to reduce noise
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label: string) => ({ level: label.toUpperCase() }),
    },
  });
  public readonly router: Hono<AppEnv>;

  /**
   * Constructs a new DocumentApi instance.
   * @param repo - An implementation of IDocumentRepository interface.
   */
  constructor() {
    this.router = new Hono<AppEnv>(); // Initialize Hono router
    this.appUses();
    this.registerRoutes();
    this.router.route('/api', new AppApi().router);
    this.registerStaticContent();
  }

  private appUses = () => {
    this.router.use(
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

    this.router.use('*', pinoLogger({ pino: this.pinoInstance }));
  };

  private registerRoutes = () => {
    this.router
      .get('/time', (c) => {
        const time = new Date().toISOString();
        const timeStr = time.slice(11, 19);
        return c.text(
          `Hello Hono - (${c.env.APP_VERSION})! The current time is ${timeStr}`,
        );
      })
      .get('/app-beat', (c) => {
        const time = new Date().toISOString();
        c.get('logger').info({ time }, 'API heartbeat check');
        return c.json({
          status: 'ok',
          timestamp: time,
          message: `${c.env.APP_NAME} - API (${c.env.APP_VERSION}) is working fine! (${time.slice(11, 19)})`,
        });
      });
  };

  private registerStaticContent = () => {
    this.router.get('*', async (c) => {
      const url = new URL(c.req.url);
      const path = url.pathname;
      const fileName = path.split('/').pop() ?? 'unknown';

      const res = await c.env.ASSETS.fetch(c.req.raw);

      if (res.status !== 404) {
        const newRes = new Response(res.body, res);
        const cacheControl =
          c.env.IS_DEVELOPMENT === 'true'
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
  };
}

export default new App().router;
