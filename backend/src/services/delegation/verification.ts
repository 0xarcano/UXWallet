/**
 * EIP-712 delegation signature verification.
 */
import { recoverTypedDataAddress } from "viem";

/** The typed-data payload the frontend signs during delegation. */
export interface DelegationPayload {
  readonly sessionKeyAddress: string;
  readonly permissionScope: string;
  readonly ttlSeconds?: number;
  readonly nonce: number;
  readonly chainId: number;
}

/**
 * EIP-712 domain for UXWallet delegation.
 */
const DELEGATION_DOMAIN = {
  name: "UXWallet",
  version: "1",
} as const;

/**
 * EIP-712 types for the delegation message.
 */
const DELEGATION_TYPES = {
  Delegation: [
    { name: "sessionKeyAddress", type: "address" },
    { name: "permissionScope", type: "string" },
    { name: "ttlSeconds", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "chainId", type: "uint256" },
  ],
} as const;

/**
 * Verify an EIP-712 delegation signature and return the recovered address.
 */
export async function verifyEip712Delegation(
  signature: `0x${string}`,
  payload: DelegationPayload,
): Promise<`0x${string}`> {
  const address = await recoverTypedDataAddress({
    domain: {
      ...DELEGATION_DOMAIN,
      chainId: BigInt(payload.chainId),
    },
    types: DELEGATION_TYPES,
    primaryType: "Delegation",
    message: {
      sessionKeyAddress: payload.sessionKeyAddress as `0x${string}`,
      permissionScope: payload.permissionScope,
      ttlSeconds: BigInt(payload.ttlSeconds ?? 86400),
      nonce: BigInt(payload.nonce),
      chainId: BigInt(payload.chainId),
    },
    signature,
  });

  return address;
}

/**
 * Validate that a signature matches EIP-712 format (basic hex check).
 */
export function isValidSignature(sig: string): boolean {
  return /^0x[0-9a-fA-F]{130}$/.test(sig);
}
