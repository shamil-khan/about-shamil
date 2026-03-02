/**
 * IUnifiedRedis: Normalizes differences between Upstash REST and Local TCP clients.
 */
export interface IUnifiedRedis {
  /** Retrieves a string value by key */
  get(key: string): Promise<string | null>;
  /** Retrieves multiple string values by keys */
  mget(...keys: string[]): Promise<(string | null)[]>;
  /** Sets a string value with an optional key */
  set(key: string, value: string): Promise<void>;
  /** Deletes one or more keys. Returns number of keys deleted. */
  del(...keys: string[]): Promise<number>;
  /** Adds one or more members to a Set index. */
  sadd(key: string, ...members: string[]): Promise<number>;
  /** Removes one or more members from a Set index. */
  srem(key: string, ...members: string[]): Promise<number>;
  /** Returns all members of a Set index. */
  smembers(key: string): Promise<string[]>;
  /** Sets a timeout on a key in seconds. */
  expire(key: string, seconds: number): Promise<number>;
}

import { createRedis as createLocalRedis } from 'redis-on-workers';
import { Redis as UpstashRedis } from '@upstash/redis/cloudflare';

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

import { DataPayload, DocMeta, IDataRepository } from '../models/types';

/**
 * Redis implementation of IDataRepository.
 * Uses composite indexing to simulate RDBMS constraints and fast lookups.
 */
/** @inheritDoc IDataRepository */

export class RedisDataRepository implements IDataRepository {
  constructor(private readonly redis: IUnifiedRedis) {}

  /** @inheritDoc IDataRepository.addDoc */
  async addDoc(payload: DataPayload): Promise<void> {
    const { id, userId, profileName, languageCode } = payload;

    // Define all keys
    const uniqueKey = `unique:user:${userId}:profile:${profileName}:lang:${languageCode}`;
    const primaryKey = `data:${id}`;
    const metaKey = `meta:${id}`;
    const userIndexKey = `index:user:${userId}:ids`;
    const globalIndexKey = `index:all_docs:ids`;

    // Check for Unique Constraint Violation
    const existingId = await this.redis.get(uniqueKey);
    if (existingId) {
      throw new Error(
        `Constraint Violation: Record already exists for User:${userId} with Profile:${profileName} and Language:${languageCode}`,
      );
    }

    const metadata: DocMeta = { id, userId, profileName, languageCode };

    // Write data and update all indices atomically
    await Promise.all([
      this.redis.set(primaryKey, JSON.stringify(payload)),
      this.redis.set(metaKey, JSON.stringify(metadata)),
      this.redis.set(uniqueKey, id),
      this.redis.sadd(userIndexKey, id),
      this.redis.sadd(globalIndexKey, id),
    ]);
  }

  /** @inheritDoc IDataRepository.getDoc */
  async getDoc(id: string): Promise<DataPayload | null> {
    const raw = await this.redis.get(`data:${id}`);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as DataPayload;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Parse error';
      console.error(`Failed to parse DataPayload for ID: ${id}`, message);
      return null;
    }
  }

  /** @inheritDoc IDataRepository.getUserDocs */
  async getUserDocs(userId: string): Promise<DataPayload[]> {
    const indexKey = `index:user:${userId}:ids`;

    const ids = await this.redis.smembers(indexKey);
    if (ids.length === 0) return [];

    const keys = ids.map((id) => `data:${id}`);
    const rawRecords = await this.redis.mget(...keys);

    const results: DataPayload[] = [];

    for (let i = 0; i < rawRecords.length; i++) {
      const raw = rawRecords[i];
      if (!raw) continue;

      try {
        const payload = JSON.parse(raw) as DataPayload;
        results.push(payload);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Parse error';
        console.error(`Failed to parse document ${ids[i]}:`, message);
        // Continue processing other documents instead of failing
      }
    }

    return results;
  }

  /** @inheritDoc IDataRepository.getUserDocMeta */
  async getUserDocMeta(userId: string): Promise<DocMeta[]> {
    const indexKey = `index:user:${userId}:ids`;

    const ids = await this.redis.smembers(indexKey);
    if (ids.length === 0) return [];

    const metaKeys = ids.map((id) => `meta:${id}`);
    const rawMeta = await this.redis.mget(...metaKeys);

    const results: DocMeta[] = [];

    for (let i = 0; i < rawMeta.length; i++) {
      const raw = rawMeta[i];
      if (!raw) continue;

      try {
        const meta = JSON.parse(raw) as DocMeta;
        results.push(meta);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Parse error';
        console.error(`Failed to parse metadata for ${ids[i]}:`, message);
      }
    }

    return results;
  }

  /** @inheritDoc IDataRepository.listDocs */
  async listDocs(): Promise<DocMeta[]> {
    const globalIndexKey = `index:all_docs:ids`;

    const allIds = await this.redis.smembers(globalIndexKey);
    if (allIds.length === 0) return [];

    const metaKeys = allIds.map((id) => `meta:${id}`);
    const rawMeta = await this.redis.mget(...metaKeys);

    const results: DocMeta[] = [];

    for (let i = 0; i < rawMeta.length; i++) {
      const raw = rawMeta[i];
      if (!raw) continue;

      try {
        const meta = JSON.parse(raw) as DocMeta;
        results.push(meta);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Parse error';
        console.error(`Failed to parse metadata for ${allIds[i]}:`, message);
      }
    }

    return results;
  }

  /** @inheritDoc IDataRepository.editDoc */
  async editDoc(id: string, newPayload: DataPayload): Promise<void> {
    const oldDoc = await this.getDoc(id);
    if (!oldDoc) {
      throw new Error(`Edit failed: Document with ID ${id} not found.`);
    }

    const oldUniqueKey = `unique:user:${oldDoc.userId}:profile:${oldDoc.profileName}:lang:${oldDoc.languageCode}`;
    const newUniqueKey = `unique:user:${newPayload.userId}:profile:${newPayload.profileName}:lang:${newPayload.languageCode}`;

    if (oldUniqueKey !== newUniqueKey) {
      const conflictId = await this.redis.get(newUniqueKey);
      if (conflictId && conflictId !== id) {
        throw new Error(
          `Edit failed: New profile/language combination already exists for this user.`,
        );
      }
    }

    const metadata: DocMeta = {
      id: newPayload.id,
      userId: newPayload.userId,
      profileName: newPayload.profileName,
      languageCode: newPayload.languageCode,
    };

    const tasks: Promise<unknown>[] = [
      this.redis.set(`data:${id}`, JSON.stringify(newPayload)),
      this.redis.set(`meta:${id}`, JSON.stringify(metadata)),
    ];

    if (oldUniqueKey !== newUniqueKey) {
      tasks.push(this.redis.del(oldUniqueKey));
      tasks.push(this.redis.set(newUniqueKey, id));
    }

    if (oldDoc.userId !== newPayload.userId) {
      tasks.push(this.redis.srem(`index:user:${oldDoc.userId}:ids`, id));
      tasks.push(this.redis.sadd(`index:user:${newPayload.userId}:ids`, id));
    }

    await Promise.all(tasks);
  }

  /** @inheritDoc IDataRepository.deleteDoc */
  async deleteDoc(id: string): Promise<void> {
    const doc = await this.getDoc(id);
    if (!doc) return;

    const keysToDelete = [
      `data:${id}`,
      `meta:${id}`,
      `unique:user:${doc.userId}:profile:${doc.profileName}:lang:${doc.languageCode}`,
    ];

    await Promise.all([
      this.redis.del(...keysToDelete),
      this.redis.srem(`index:user:${doc.userId}:ids`, id),
      this.redis.srem(`index:all_docs:ids`, id),
    ]);
  }

  /** @inheritDoc IDataRepository.deleteUserDocs */
  async deleteUserDocs(userId: string): Promise<string[]> {
    const userIndexKey = `index:user:${userId}:ids`;
    const ids = await this.redis.smembers(userIndexKey);

    if (ids.length === 0) return [];

    await this.deleteDocs(ids);
    return ids;
  }

  /** @inheritDoc IDataRepository.deleteDocs */
  async deleteDocs(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const metaKeys = ids.map((id) => `meta:${id}`);
    const rawMetas = await this.redis.mget(...metaKeys);

    const keysToDelete: string[] = [];
    const userSetTasks: Promise<number>[] = [];

    for (let i = 0; i < rawMetas.length; i++) {
      const raw = rawMetas[i];
      if (!raw) continue;

      try {
        const { id, userId, profileName, languageCode } = JSON.parse(
          raw,
        ) as DocMeta;

        keysToDelete.push(
          `data:${id}`,
          `meta:${id}`,
          `unique:user:${userId}:profile:${profileName}:lang:${languageCode}`,
        );

        userSetTasks.push(this.redis.srem(`index:user:${userId}:ids`, id));
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Parse error';
        console.error(
          `Cleanup failed for ID ${ids[i]}: Invalid Metadata`,
          message,
        );
      }
    }

    if (keysToDelete.length === 0) return;

    await Promise.all([
      this.redis.del(...keysToDelete),
      this.redis.srem(`index:all_docs:ids`, ...ids),
      ...userSetTasks,
    ]);
  }

  /** @inheritDoc IDataRepository.deleteAll */
  async deleteAll(): Promise<void> {
    const globalIndexKey = `index:all_docs:ids`;
    const allIds = await this.redis.smembers(globalIndexKey);

    if (allIds.length === 0) return;

    await this.deleteDocs(allIds);
    await this.redis.del(globalIndexKey);
  }
}
