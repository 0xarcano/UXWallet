import { z } from 'zod';

export const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

export const uint256StringSchema = z
  .string()
  .regex(/^\d+$/, 'Invalid uint256 string');

export const chainIdSchema = z.number().int().positive('Chain ID must be a positive integer');
