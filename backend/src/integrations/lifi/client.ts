import { logger as baseLogger } from '../../lib/logger.js';

const logger = baseLogger.child({ module: 'lifi' });

// ── Types ───────────────────────────────────────────────────────────────────

export interface LifiQuoteRequest {
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
}

export interface LifiQuote {
  id: string;
  estimatedAmount: string;
  estimatedGas: string;
  route: string;
}

export interface LifiIntentRequest {
  quoteId: string;
  fromAddress: string;
  toAddress: string;
}

export interface LifiIntentResult {
  intentId: string;
  status: 'submitted' | 'fulfilled' | 'failed';
  txHash?: string;
}

// ── Interface ───────────────────────────────────────────────────────────────

export interface ILifiClient {
  getQuote(req: LifiQuoteRequest): Promise<LifiQuote>;
  submitIntent(req: LifiIntentRequest): Promise<LifiIntentResult>;
}

// ── Mock implementation (MVP) ───────────────────────────────────────────────

/**
 * Mocked LiFi client for MVP.
 *
 * Returns deterministic fake data. When the real lif-rust microservice is
 * available, swap this for a REST-based implementation of `ILifiClient`.
 */
export class MockLifiClient implements ILifiClient {
  async getQuote(req: LifiQuoteRequest): Promise<LifiQuote> {
    logger.info({ req }, 'Mock LiFi: getQuote');

    return {
      id: `mock-quote-${Date.now()}`,
      estimatedAmount: req.fromAmount,
      estimatedGas: '21000',
      route: `${req.fromChainId}→${req.toChainId}`,
    };
  }

  async submitIntent(req: LifiIntentRequest): Promise<LifiIntentResult> {
    logger.info({ req }, 'Mock LiFi: submitIntent');

    return {
      intentId: `mock-intent-${Date.now()}`,
      status: 'fulfilled',
      txHash: '0x' + '0'.repeat(64),
    };
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

let _client: ILifiClient | undefined;

export function getLifiClient(): ILifiClient {
  if (!_client) {
    _client = new MockLifiClient();
    logger.warn('Using MOCKED LiFi client — not suitable for production.');
  }
  return _client;
}

export function setLifiClient(client: ILifiClient): void {
  _client = client;
}
