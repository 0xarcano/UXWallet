/**
 * KMS abstraction types.
 * Production plugs AWS KMS / HashiCorp Vault; local dev uses an env-based key.
 */

export interface KmsSigner {
  /**
   * Sign a message hash (32 bytes) and return the signature.
   */
  sign(messageHash: `0x${string}`): Promise<`0x${string}`>;

  /**
   * Get the public address associated with this signer.
   */
  getAddress(): Promise<`0x${string}`>;
}

export interface KeyStore {
  /**
   * Get or create the signer for the given scope.
   */
  getSigner(scope: string): Promise<KmsSigner>;
}
