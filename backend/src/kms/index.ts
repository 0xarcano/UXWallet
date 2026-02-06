/**
 * KMS module — factory that returns the configured KeyStore implementation.
 */
import type { KeyStore } from "./types.js";
import { LocalKeyStore } from "./localSigner.js";
import { config } from "../config/index.js";
import { logger } from "../lib/logger.js";

export type { KmsSigner, KeyStore } from "./types.js";

let keyStoreInstance: KeyStore | null = null;

export function getKeyStore(): KeyStore {
  if (keyStoreInstance) return keyStoreInstance;

  switch (config.kms.provider) {
    case "local":
      keyStoreInstance = new LocalKeyStore();
      break;
    case "aws":
      // TODO: Implement AwsKeyStore when moving to production
      logger.warn("AWS KMS not yet implemented — falling back to local");
      keyStoreInstance = new LocalKeyStore();
      break;
    default:
      throw new Error(`Unknown KMS provider: ${config.kms.provider}`);
  }

  return keyStoreInstance;
}
