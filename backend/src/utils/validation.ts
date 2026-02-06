/**
 * Common validation helpers.
 */
import { isAddress } from "viem";
import { ValidationError } from "../lib/errors.js";

export function validateAddress(address: string, field = "address"): `0x${string}` {
  if (!isAddress(address)) {
    throw new ValidationError(`Invalid Ethereum address for field '${field}': ${address}`);
  }
  return address as `0x${string}`;
}

export function validateChainId(chainId: number, field = "chainId"): number {
  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new ValidationError(`Invalid chain ID for field '${field}': ${chainId}`);
  }
  return chainId;
}

export function validatePositiveAmount(amount: string, field = "amount"): bigint {
  try {
    const value = BigInt(amount);
    if (value <= 0n) {
      throw new Error("non-positive");
    }
    return value;
  } catch {
    throw new ValidationError(`Invalid positive amount for field '${field}': ${amount}`);
  }
}

export function validateHexString(hex: string, field = "hex"): `0x${string}` {
  if (!/^0x[0-9a-fA-F]+$/.test(hex)) {
    throw new ValidationError(`Invalid hex string for field '${field}': ${hex}`);
  }
  return hex as `0x${string}`;
}
