import { Hono } from 'hono';
import { AppEnv } from '../AppContext';
import { getRedis } from '../libs';
import { DocumentApi, DocumentSwaggerApi } from '.';

export class AppApi {
  public readonly router: Hono<AppEnv>;

  /**
   * Constructs a new DocumentApi instance.
   * @param repo - An implementation of IDocumentRepository interface.
   */
  constructor() {
    this.router = new Hono<AppEnv>();
    this.useRedis();
    this.registerRoutes();
    this.router.route(
      '/docs/swagger',
      new DocumentSwaggerApi('/api/docs/swagger').router,
    );
    this.router.route('/docs', new DocumentApi().router);
  }

  private useRedis = () => {
    //create redis connection for every request start from /api.
    this.router.use('*', async (c, next) => {
      const log = c.get('logger');
      const url =
        c.env.IS_DEVELOPMENT === 'true'
          ? c.env.REDIS_URL
          : c.env.UPSTASH_REDIS_REST_URL;

      if (!url) {
        log.warn({}, 'Redis URL not configured');
      } else {
        try {
          const redisInstance =
            c.env.IS_DEVELOPMENT === 'true'
              ? getRedis(url)
              : getRedis(url, c.env.UPSTASH_REDIS_REST_TOKEN);

          c.set('redis', redisInstance);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Unknown error';
          log.error({ error: message }, 'Redis connection failed');
          return null;
        }
      }

      await next();
    });
  };

  private registerRoutes = () => {
    this.router.get('/info', (c) => {
      const { APP_NAME, APP_VERSION, IS_DEVELOPMENT } = c.env;
      const redisUrl =
        c.env.IS_DEVELOPMENT === 'true'
          ? c.env.REDIS_URL
          : c.env.UPSTASH_REDIS_REST_URL;

      return c.json({
        name: APP_NAME,
        version: APP_VERSION,
        isDevelopment: IS_DEVELOPMENT == 'true' ? 'YES' : 'NO',
        redisConfigured: redisUrl ? 'YES' : 'NO',
      });
    });

    this.router.get('/ping', async (c) => {
      const redis = c.get('redis');
      const response = await redis.ping();
      return c.json(response);
    });
  };
}
