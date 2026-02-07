import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url('EXPO_PUBLIC_API_URL must be a valid URL'),
  EXPO_PUBLIC_WS_URL: z.string().min(1, 'EXPO_PUBLIC_WS_URL is required'),
  EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID: z
    .string()
    .min(1, 'EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID is required'),
  EXPO_PUBLIC_CHAIN_ENV: z.enum(['testnet', 'mainnet']),
});

type Env = z.infer<typeof envSchema>;

const DEV_DEFAULTS: Env = {
  EXPO_PUBLIC_API_URL: 'http://localhost:3000/api',
  EXPO_PUBLIC_WS_URL: 'ws://localhost:3000/ws',
  EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID: 'placeholder',
  EXPO_PUBLIC_CHAIN_ENV: 'testnet',
};

function getEnv(): Env {
  const result = envSchema.safeParse({
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_WS_URL: process.env.EXPO_PUBLIC_WS_URL,
    EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID,
    EXPO_PUBLIC_CHAIN_ENV: process.env.EXPO_PUBLIC_CHAIN_ENV,
  });

  if (!result.success) {
    if (__DEV__) {
      const formatted = result.error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      console.warn(`Missing environment variables (using dev defaults):\n${formatted}`);
      return DEV_DEFAULTS;
    }
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }

  return result.data;
}

export const env = getEnv();
