/**
 * Local KMS signer for development — uses a private key from env.
 */
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import type { KmsSigner, KeyStore } from "./types.js";
import { config } from "../config/index.js";
import { logger } from "../lib/logger.js";

class LocalSigner implements KmsSigner {
  private readonly account: PrivateKeyAccount;

  constructor(privateKey: `0x${string}`) {
    this.account = privateKeyToAccount(privateKey);
  }

  async sign(messageHash: `0x${string}`): Promise<`0x${string}`> {
    const signature = await this.account.signMessage({
      message: { raw: messageHash },
    });
    return signature;
  }

  async getAddress(): Promise<`0x${string}`> {
    return this.account.address;
  }
}

export class LocalKeyStore implements KeyStore {
  private readonly signer: LocalSigner;

  constructor() {
    const pk = config.kms.localPrivateKey;
    if (!pk) {
      throw new Error("KMS_LOCAL_PRIVATE_KEY is required when KMS_PROVIDER=local");
    }
    this.signer = new LocalSigner(pk as `0x${string}`);
    logger.info("LocalKeyStore initialized (development mode)");
  }

  async getSigner(_scope: string): Promise<KmsSigner> {
    // In local mode, all scopes share the same key
    return this.signer;
  }
}
