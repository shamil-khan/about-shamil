import { Hono } from 'hono';

class SampleApi3 {
  public readonly router: Hono;

  constructor() {
    this.router = new Hono();
    this.registerRoutes(); // Setup API routes
  }

  private registerRoutes = () => {
    this.router.get('/info', (c) => {
      return c.json({ message: 'hello - sample api 3' });
    });
  };
}

class SampleApi2 {
  public readonly router: Hono;

  constructor() {
    this.router = new Hono().basePath('/api');
    this.registerRoutes(); // Setup API routes
    this.router.route('/docs', new SampleApi3().router);
  }

  private registerRoutes = () => {
    this.router.get('/info', (c) => {
      return c.json({ message: 'hello - sample api 2' });
    });
  };
}

class SampleApi1 {
  public readonly router: Hono;

  constructor() {
    this.router = new Hono();
    this.registerRoutes(); // Setup API routes
    this.router.route('/', new SampleApi2().router);
  }

  private registerRoutes = () => {
    this.router.get('/info', (c) => {
      return c.json({ message: 'hello sample api 1' });
    });
  };
}

export default new SampleApi1().router;
