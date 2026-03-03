import { createRedis as createLocalRedis } from 'redis-on-workers';
import { Redis as UpstashRedis } from '@upstash/redis/cloudflare';
import { IUnifiedRedis } from './IUnifiedRedis';

/**
 * REDIS CLIENT FACTORY
 * Creates a normalized client for either Upstash (Production) or Local (Docker).
 *
 * @param url - Connection URL (redis://... for local, https://... for Upstash)
 * @param token - Optional Upstash REST token. If provided, Upstash client is used.
 */
export function getRedis(url: string, token?: string): IUnifiedRedis {
  // --- PRODUCTION (Upstash REST) ---

  if (token) {
    const upstash = new UpstashRedis({ url: url, token: token });
    return {
      get: async (key: string) => {
        const val = await upstash.get(key);
        return typeof val === 'string' ? val : JSON.stringify(val);
      },
      mget: async (...keys: string[]) => {
        const results = await upstash.mget<(string | null)[]>(...keys);
        return results.map((v: unknown) =>
          typeof v === 'object' && v !== null
            ? JSON.stringify(v)
            : (v as string | null),
        );
      },
      set: async (key: string, value: string) => {
        await upstash.set(key, value);
      },
      del: async (...keys: string[]) => {
        return await upstash.del(...keys);
      },
      sadd: async (key: string, ...members: string[]) => {
        if (members.length === 0) return 0;
        // const [first, ...rest] = members;
        // return await upstash.sadd(key, first, ...rest);
        return await upstash.sadd(key, members);
      },
      srem: async (key: string, ...members: string[]) => {
        if (members.length === 0) return 0;
        // const [first, ...rest] = members;
        // return await upstash.sadd(key, first, ...rest);
        return await upstash.srem(key, members);
      },
      smembers: async (key: string) => {
        return await upstash.smembers<string[]>(key);
      },
      expire: async (key: string, seconds: number) => {
        return await upstash.expire(key, seconds);
      },
    };
  }

  // --- LOCAL / DOCKER (TCP via redis-on-workers) ---
  const local = createLocalRedis(url);
  return {
    get: async (key: string) => {
      const res = await local.send('GET', key);
      return res as string | null;
    },
    mget: async (...keys: string[]) => {
      const res = await local.send('MGET', ...keys);
      return res as (string | null)[];
    },
    set: async (key: string, value: string) => {
      await local.send('SET', key, value);
    },
    del: async (...keys: string[]) => {
      const res = await local.send('DEL', ...keys);
      return Number(res);
    },
    sadd: async (key: string, ...members: string[]) => {
      const res = await local.send('SADD', key, ...members);
      return Number(res);
    },
    srem: async (key: string, ...members: string[]) => {
      const res = await local.send('SREM', key, ...members);
      return Number(res);
    },
    smembers: async (key: string) => {
      const res = await local.send('SMEMBERS', key);
      return (res as string[]) || [];
    },
    expire: async (key: string, seconds: number) => {
      const res = await local.send('EXPIRE', key, seconds.toString());
      return Number(res);
    },
  };
}
