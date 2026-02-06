import { z } from 'zod';

// ── Reusable Zod primitives ─────────────────────────────────────────────────

/** 0x-prefixed, 40-hex-char Ethereum address. */
export const ethereumAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

/** Non-negative integer represented as a string (for BigInt values). */
export const uint256String = z
  .string()
  .regex(/^\d+$/, 'Must be a non-negative integer string');

/** Positive chain ID. */
export const chainId = z.number().int().positive();

/** Hex-encoded byte string (0x…). */
export const hexString = z
  .string()
  .regex(/^0x[a-fA-F0-9]*$/, 'Invalid hex string');

// ── Composite schemas ───────────────────────────────────────────────────────

export const allowanceSchema = z.object({
  asset: z.string().min(1),
  amount: uint256String,
});

export const delegationRequestSchema = z.object({
  userAddress: ethereumAddress,
  sessionKeyAddress: ethereumAddress,
  application: z.string().min(1),
  scope: z.string().min(1),
  allowances: z.array(allowanceSchema),
  expiresAt: z.number().int().positive(),
  signature: hexString,
});

export const withdrawalRequestSchema = z.object({
  userAddress: ethereumAddress,
  asset: z.string().min(1),
  amount: uint256String,
  chainId,
});

export const balanceQuerySchema = z.object({
  userAddress: ethereumAddress,
  asset: z.string().min(1).optional(),
});

export const stateQuerySchema = z.object({
  channelId: hexString.optional(),
  userAddress: ethereumAddress.optional(),
});
