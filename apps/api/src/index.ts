import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  const time = new Date().toISOString();

  return c.text(`Hello Hono! The current time is ${time.slice(11, 19)}`);
});

export default app;
