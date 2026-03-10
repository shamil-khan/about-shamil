/**
 * IUnifiedRedis: Normalizes differences between Upstash REST and Local TCP clients.
 */
export interface IUnifiedRedis {
  ping(): Promise<string | null>;
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
