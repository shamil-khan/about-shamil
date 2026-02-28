import { createRedis as createLocalRedis } from 'redis-on-workers';
import { Redis as UpstashRedis } from '@upstash/redis/cloudflare';

/**
 * Define the strictly typed interface for our app
 */
export interface IUnifiedRedis {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

/**
 * REDIS CLIENT FACTORY
 * @param localUrl - redis://localhost:6379 (Used in Docker)
 * @param prodUrl - https://...upstash.io (Used in Cloudflare)
 * @param prodToken - Upstash REST Token (Used in Cloudflare)
 */
export function getRedis(
  localUrl: string,
  prodUrl?: string,
  prodToken?: string,
): IUnifiedRedis {
  // --- PRODUCTION (Upstash REST) ---
  if (prodUrl && prodToken) {
    const upstash = new UpstashRedis({ url: prodUrl, token: prodToken });
    return {
      get: async (key) => {
        const val = await upstash.get(key);
        return typeof val === 'string' ? val : JSON.stringify(val);
      },
      set: async (key, value) => {
        await upstash.set(key, value);
      },
      del: async (key) => {
        return await upstash.del(key);
      },
      expire: async (key, seconds) => {
        return await upstash.expire(key, seconds);
      },
    };
  }

  // Fallback to Local Docker (TCP)
  const local = createLocalRedis(localUrl);
  return {
    get: async (key) => {
      const res = await local.send('GET', key);
      return res as string | null;
    },
    set: async (key, value) => {
      await local.send('SET', key, value);
    },
    del: async (key) => {
      const res = await local.send('DEL', key);
      return Number(res);
    },
    expire: async (key, seconds) => {
      const res = await local.send('EXPIRE', key, seconds.toString());
      return Number(res);
    },
  };
}
