import {
  privateKeyToAccount,
  type PrivateKeyAccount,
} from 'viem/accounts';
import type { Hex } from 'viem';
import type { Signer } from './types.js';

/**
 * Local (in-process) signer backed by a raw private key.
 * Suitable for development and testnet MVPs.
 *
 * For production, replace with an AWS KMS / HashiCorp Vault implementation
 * that satisfies the same `Signer` interface.
 */
export class LocalSigner implements Signer {
  private readonly account: PrivateKeyAccount;

  constructor(privateKey: Hex) {
    this.account = privateKeyToAccount(privateKey);
  }

  getAddress(): string {
    return this.account.address;
  }

  async signMessage(message: Uint8Array | string): Promise<string> {
    const raw = typeof message === 'string' ? message : ({ raw: message } as const);
    return this.account.signMessage({ message: raw });
  }

  async signRaw(hash: `0x${string}`): Promise<string> {
    return this.account.sign({ hash });
  }

  async signTypedData(
    domain: Record<string, unknown>,
    types: Record<string, Array<{ name: string; type: string }>>,
    value: Record<string, unknown>,
  ): Promise<string> {
    return this.account.signTypedData({
      domain: domain as any,
      types: types as any,
      primaryType: Object.keys(types).find((k) => k !== 'EIP712Domain') ?? '',
      message: value as any,
    });
  }
}
