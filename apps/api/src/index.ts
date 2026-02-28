import { Hono } from 'hono';
import { cors } from 'hono/cors';
import pino from 'pino';
import { pinoLogger, type PinoLogger } from 'hono-pino';

const VERSION = 'V1';

// Define the Environment Types so c.get('logger') works
type Env = {
  Variables: {
    logger: PinoLogger;
  };
  Bindings: {
    ASSETS: Fetcher;
  };
};

const app = new Hono<Env>();

// 1. MUST BE FIRST: Global CORS middleware
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin,
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
});

app.use(pinoLogger({ pino: logger }));

app.get('/time', (c) => {
  const time = new Date().toISOString();

  return c.text(
    `Hello Hono - (${VERSION})! The current time is ${time.slice(11, 19)}`,
  );
});

app.get('/api', (c) => {
  const time = new Date().toISOString();

  c.get('logger').info({ time }, 'API check successful');

  return c.json({
    status: 'ok',
    timestamp: time,
    message: `API (${VERSION}) is working fine! (${time.slice(11, 19)})`,
  });
});

app.get('*', async (c) => {
  const url = new URL(c.req.url);
  const path = url.pathname;
  const fileName = path.split('/').pop() || path;

  // 1. Try to fetch from web/dist via the ASSETS binding
  const res = await c.env.ASSETS.fetch(c.req.raw);

  // 2. SUCCESS: File exists in web/dist (CSS, JS, Images, etc.)
  if (res.status !== 404) {
    const newRes = new Response(res.body, res);
    // Add long-term caching for static assets
    newRes.headers.set(
      'Cache-Control',
      'public, max-age=31536000, stale-while-revalidate=86400',
    );
    return newRes;
  }

  // 3. 404 HANDLING: File not found in web/dist
  const isAsset = /\.(png|jpe?g|gif|svg|ico|css|js|woff2?|map|json)$/i.test(
    path,
  );

  if (isAsset) {
    // Log the missing file to your terminal via Pino
    c.get('logger').error({ path, fileName }, `Static asset missing`);
    return c.text(`Asset "${fileName}" not found`, 404);
  }

  c.get('logger').warn({ path }, 'Page not found - showing Dino Game');

  return c.html(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>404 | Page Not Found</title>
      <style>
        body { background: #0f172a; color: #f8fafc; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .box { text-align: center; background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; width: 90%; max-width: 500px; }
        h1 { color: #38bdf8; font-size: 4rem; margin: 0; }
        iframe { width: 100%; height: 200px; border-radius: 8px; border: 2px solid #334155; margin: 1.5rem 0; background: #fff; }
        .path { color: #94a3b8; font-family: monospace; background: #0f172a; padding: 2px 6px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>404</h1>
        <p>The page <span class="path">${path}</span> does not exist.</p>
        <a href="/" style="color: #38bdf8; text-decoration: none; font-weight: bold;">← Go Home</a>
      </div>
    </body>
    </html>
  `,
    404,
  );
});

export default app;
