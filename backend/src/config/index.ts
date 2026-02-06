import 'dotenv/config';
import { z } from 'zod';

// Yellow ClearNode URLs
const CLEARNODE_WSS_PRODUCTION = 'wss://clearnet.yellow.com/ws';
const CLEARNODE_WSS_SANDBOX = 'wss://clearnet-sandbox.yellow.com/ws';

/** Use Yellow sandbox for test env, production ClearNode otherwise. */
const defaultClearNodeUrl =
  process.env['NODE_ENV'] === 'test'
    ? CLEARNODE_WSS_SANDBOX
    : CLEARNODE_WSS_PRODUCTION;

/** In test env, allow DATABASE_URL to be unset and use a placeholder so getConfig() works from .env only. */
const defaultDatabaseUrl =
  process.env['NODE_ENV'] === 'test'
    ? 'postgresql://localhost:5432/flywheel_test?schema=public'
    : undefined;

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),

  DATABASE_URL:
    defaultDatabaseUrl !== undefined
      ? z.string().default(defaultDatabaseUrl)
      : z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  CLEARNODE_WSS_URL: z
    .string()
    .default(defaultClearNodeUrl),
  CLEARNODE_APPLICATION: z.string().default('Flywheel'),

  RPC_URL_SEPOLIA: z.string().default('https://rpc.sepolia.org'),
  RPC_URL_BASE_SEPOLIA: z.string().default('https://sepolia.base.org'),

  SOLVER_PRIVATE_KEY: z.string().default(''),

  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

  SESSION_KEY_DEFAULT_TTL_SECONDS: z.coerce.number().default(3600),
});

export type Config = z.infer<typeof envSchema>;

let _config: Config | undefined;

export function getConfig(): Config {
  if (!_config) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      const formatted = result.error.format();
      throw new Error(
        `Invalid environment configuration:\n${JSON.stringify(formatted, null, 2)}`,
      );
    }
    _config = result.data;
  }
  return _config;
}

/** Reset cached config — useful in tests. */
export function resetConfig(): void {
  _config = undefined;
}
