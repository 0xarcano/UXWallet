import { EIP712AuthTypes } from '@erc7824/nitrolite';
import type { Allowance } from '@/types/delegation';

export const FLYWHEEL_DOMAIN = { name: 'Flywheel' } as const;
export const DELEGATION_PRIMARY_TYPE = 'Policy' as const;

export interface DelegationTypedData {
  domain: typeof FLYWHEEL_DOMAIN;
  types: typeof EIP712AuthTypes;
  primaryType: typeof DELEGATION_PRIMARY_TYPE;
  message: {
    challenge: string;
    scope: string;
    wallet: string;
    session_key: string;
    expires_at: bigint;
    allowances: Allowance[];
  };
}

export function buildDelegationTypedData(params: {
  wallet: string;
  sessionKey: string;
  scope: string;
  expiresAt: number;
  allowances: Allowance[];
}): DelegationTypedData {
  return {
    domain: FLYWHEEL_DOMAIN,
    types: EIP712AuthTypes,
    primaryType: DELEGATION_PRIMARY_TYPE,
    message: {
      challenge: '',
      scope: params.scope,
      wallet: params.wallet,
      session_key: params.sessionKey,
      expires_at: BigInt(params.expiresAt),
      allowances: params.allowances,
    },
  };
}
