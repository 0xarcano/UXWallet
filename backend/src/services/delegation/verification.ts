import { verifyMessage, verifyTypedData, type Hex } from 'viem';
import { EIP712AuthTypes } from '@erc7824/nitrolite';
import { AppError, ErrorCode } from '../../lib/errors.js';
import { logger as baseLogger } from '../../lib/logger.js';

const logger = baseLogger.child({ module: 'delegation:verification' });

export interface DelegationData {
  userAddress: string;
  sessionKeyAddress: string;
  application: string;
  scope: string;
  allowances: Array<{ asset: string; amount: string }>;
  expiresAt: number;
  signature: string;
}

/**
 * Verify that the delegation EIP-712 signature was produced by the
 * claimed `userAddress`.
 *
 * The signed typed-data follows the Yellow/Nitrolite `Policy` schema.
 */
export async function verifyDelegationSignature(
  data: DelegationData,
): Promise<boolean> {
  try {
    const isValid = await verifyTypedData({
      address: data.userAddress as Hex,
      domain: { name: data.application },
      types: EIP712AuthTypes,
      primaryType: 'Policy',
      message: {
        challenge: '', // Registration doesn't include a server challenge
        scope: data.scope,
        wallet: data.userAddress as Hex,
        session_key: data.sessionKeyAddress as Hex,
        expires_at: BigInt(data.expiresAt),
        allowances: data.allowances,
      },
      signature: data.signature as Hex,
    });

    if (!isValid) {
      logger.warn(
        { userAddress: data.userAddress, sessionKey: data.sessionKeyAddress },
        'Delegation signature invalid',
      );
    }

    return isValid;
  } catch (err) {
    logger.error({ err }, 'Delegation signature verification failed');
    return false;
  }
}

/**
 * Check that a session key is allowed to perform an operation
 * within its allowance limits.
 */
export function validateAllowance(
  allowances: Array<{ asset: string; amount: string }>,
  asset: string,
  amount: bigint,
): void {
  const entry = allowances.find(
    (a) => a.asset.toLowerCase() === asset.toLowerCase(),
  );

  if (!entry) {
    throw new AppError(
      ErrorCode.SESSION_KEY_INVALID,
      `Session key has no allowance for asset: ${asset}`,
    );
  }

  if (BigInt(entry.amount) < amount) {
    throw new AppError(
      ErrorCode.INSUFFICIENT_FUNDS,
      `Session key allowance exceeded for ${asset}: allowed ${entry.amount}, requested ${amount.toString()}`,
    );
  }
}
