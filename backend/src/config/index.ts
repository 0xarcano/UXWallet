/**
 * Centralized configuration — reads env vars and fails fast on missing critical values.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  // Server
  port: parseInt(optionalEnv("PORT", "3001"), 10),
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  isProduction: optionalEnv("NODE_ENV", "development") === "production",

  // Database
  databaseUrl: requireEnv("DATABASE_URL"),

  // Redis
  redisUrl: optionalEnv("REDIS_URL", "redis://localhost:6379"),

  // Chain RPCs
  rpcUrls: {
    yellowL3: requireEnv("RPC_URL_YELLOW_L3"),
    ethereum: requireEnv("RPC_URL_ETHEREUM"),
    base: requireEnv("RPC_URL_BASE"),
  },

  // Chain IDs
  chainIds: {
    yellowL3: parseInt(optionalEnv("CHAIN_ID_YELLOW_L3", "12345"), 10),
    ethereum: parseInt(optionalEnv("CHAIN_ID_ETHEREUM", "1"), 10),
    base: parseInt(optionalEnv("CHAIN_ID_BASE", "8453"), 10),
  },

  // lif-rust microservice
  lifRustBaseUrl: optionalEnv("LIF_RUST_BASE_URL", "http://localhost:8080"),

  // KMS
  kms: {
    provider: optionalEnv("KMS_PROVIDER", "local") as "local" | "aws",
    localPrivateKey: process.env.KMS_LOCAL_PRIVATE_KEY,
    awsKeyId: process.env.AWS_KMS_KEY_ID,
    awsRegion: process.env.AWS_REGION,
  },

  // Session keys
  sessionKeyDefaultTtlSeconds: parseInt(
    optionalEnv("SESSION_KEY_DEFAULT_TTL_SECONDS", "86400"),
    10,
  ),

  // Logging
  logLevel: optionalEnv("LOG_LEVEL", "info"),
} as const;
