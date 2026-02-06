/**
 * Abstract signer interface used across the backend.
 * KMS implementations must satisfy this contract.
 */
export interface Signer {
  /** Returns the checksummed Ethereum address of this signer. */
  getAddress(): string;

  /**
   * Sign an arbitrary message with EIP-191 prefix.
   * Returns the signature as a hex string.
   */
  signMessage(message: Uint8Array | string): Promise<string>;

  /**
   * Sign a raw keccak256 hash (no EIP-191 prefix).
   * Required for Nitrolite RPC message signing (STATE-02).
   */
  signRaw(hash: `0x${string}`): Promise<string>;

  /**
   * EIP-712 typed-data signing.
   * Returns the signature as a hex string.
   */
  signTypedData(
    domain: Record<string, unknown>,
    types: Record<string, Array<{ name: string; type: string }>>,
    value: Record<string, unknown>,
  ): Promise<string>;
}

export interface KmsConfig {
  /** Hex-encoded private key (with 0x prefix). Only used by LocalSigner. */
  solverPrivateKey: string;
}
