/**
 * LI.FI Integration - HTTP client wrapper to lif-rust microservice.
 *
 * Endpoints (from project-context.md / system_design.md):
 * - POST /lifi/quote      - Get routing quote
 * - POST /intent/build    - Build ERC-7683 intent order
 * - POST /intent/calldata - Get calldata for UXOriginSettler
 *
 * All calls use exponential backoff retry (per error_handling.md).
 */
import { config } from "../../config/index.js";
import { logger } from "../../lib/logger.js";
import { withRetry } from "../../utils/retry.js";
import { AppError } from "../../lib/errors.js";

export interface QuoteRequest {
  readonly sourceChainId: number;
  readonly destinationChainId: number;
  readonly asset: string;
  readonly amount: string;
}

export interface QuoteResponse {
  readonly route: Record<string, unknown>;
  readonly estimatedGasCost: string;
  readonly bridgeFee: string;
  readonly estimatedTime: number;
}

export interface IntentBuildRequest {
  readonly intentId: string;
  readonly sourceChainId: number;
  readonly destinationChainId: number;
  readonly asset: string;
  readonly amount: string;
}

export interface IntentBuildResponse {
  readonly orderData: Record<string, unknown>;
  readonly encodedOrder: string;
}

export interface IntentCalldataRequest {
  readonly orderData: Record<string, unknown>;
  readonly userAddress: string;
}

export interface IntentCalldataResponse {
  readonly to: string;
  readonly data: string;
  readonly value: string;
}

class LifiClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.lifRustBaseUrl;
  }

  /**
   * Get a routing quote from lif-rust.
   */
  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return this.post<QuoteResponse>("/lifi/quote", request, "getQuote");
  }

  /**
   * Build an ERC-7683 intent order.
   */
  async buildIntentOrder(request: IntentBuildRequest): Promise<IntentBuildResponse> {
    return this.post<IntentBuildResponse>("/intent/build", request, "buildIntentOrder");
  }

  /**
   * Get calldata for the UXOriginSettler contract call.
   */
  async getIntentCalldata(request: IntentCalldataRequest): Promise<IntentCalldataResponse> {
    return this.post<IntentCalldataResponse>("/intent/calldata", request, "getIntentCalldata");
  }

  /**
   * POST with retry and structured error handling.
   */
  private async post<T>(
    path: string,
    body: unknown,
    label: string,
  ): Promise<T> {
    return withRetry(
      async () => {
        const url = `${this.baseUrl}${path}`;
        logger.debug({ url, label }, "lif-rust request");

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          throw new AppError(
            `lif-rust ${label} failed: ${response.status} ${errorBody}`,
            502,
            "LIF_RUST_ERROR",
          );
        }

        return (await response.json()) as T;
      },
      { maxRetries: 3, baseDelayMs: 500, maxDelayMs: 5000, label: `lifi:${label}` },
    );
  }
}

export const lifiClient = new LifiClient();
