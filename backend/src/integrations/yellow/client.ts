/**
 * Yellow SDK Integration - wrapper for Nitrolite session management and message signing.
 *
 * Per library_patterns.md: Yellow SDK for Nitrolite session management and message signing.
 */
import { logger } from "../../lib/logger.js";
import { getKeyStore } from "../../kms/index.js";

export interface NitroliteStateUpdate {
  readonly channelId: string;
  readonly sequenceNumber: number;
  readonly stateData: Record<string, unknown>;
  readonly participantA: string;
  readonly participantB: string;
}

export interface SignedStateUpdate extends NitroliteStateUpdate {
  readonly signatureA: string;
  readonly signatureB: string;
}

class YellowClient {
  /**
   * Co-sign a state update using the ClearNode's session key.
   * This is called after the user's signature (signatureA) is verified.
   */
  async coSignStateUpdate(
    stateUpdate: NitroliteStateUpdate & { signatureA: string },
  ): Promise<SignedStateUpdate> {
    const keyStore = getKeyStore();
    const signer = await keyStore.getSigner("nitrolite_state_update");

    // Encode the state for signing (in production: ABI-encode per ERC-7824)
    const encoded = this.encodeStateForSigning(stateUpdate);

    // Sign with ClearNode's key
    const signatureB = await signer.sign(encoded as `0x${string}`);

    logger.info(
      {
        channelId: stateUpdate.channelId,
        sequenceNumber: stateUpdate.sequenceNumber,
      },
      "State update co-signed",
    );

    return {
      ...stateUpdate,
      signatureB,
    };
  }

  /**
   * Verify a user's signature on a state update.
   * In production, this would verify ERC-7824 compliant signatures.
   */
  async verifyUserSignature(
    _stateUpdate: NitroliteStateUpdate,
    signature: string,
    expectedSigner: string,
  ): Promise<boolean> {
    // TODO: Implement proper ERC-7824 signature verification using Yellow SDK
    logger.debug(
      { expectedSigner },
      "Verifying user signature",
    );

    // Placeholder: in production, use verifyTypedData or SDK method
    return signature.startsWith("0x") && signature.length === 132;
  }

  /**
   * Encode state data for signing (placeholder - real implementation uses ABI encoding).
   */
  private encodeStateForSigning(stateUpdate: NitroliteStateUpdate): string {
    // In production: keccak256(abi.encode(channelId, sequenceNumber, stateData))
    const data = JSON.stringify({
      channelId: stateUpdate.channelId,
      sequenceNumber: stateUpdate.sequenceNumber,
      stateData: stateUpdate.stateData,
    });
    // Placeholder hash
    let hash = 0n;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5n) - hash + BigInt(data.charCodeAt(i))) & ((1n << 256n) - 1n);
    }
    return `0x${hash.toString(16).padStart(64, "0")}`;
  }
}

export const yellowClient = new YellowClient();
