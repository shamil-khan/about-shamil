import { type Context } from 'hono';
import { type PinoLogger } from 'hono-pino';
import { IUnifiedRedis } from './libs';

export interface CloudflareBindings {
  APP_NAME: string;
  APP_VERSION: string;
  IS_DEVELOPMENT: boolean;
  REDIS_URL?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  ASSETS: Fetcher;
}

export interface AppVariables {
  logger: PinoLogger;
  redis: IUnifiedRedis;
}

export type AppEnv = {
  Variables: AppVariables;
  Bindings: CloudflareBindings;
};

export type AppContext = Context<AppEnv>;
