import WebSocket from 'ws';
import { EventEmitter } from 'node:events';
import { keccak256, toBytes } from 'viem';
import {
  NitroliteRPC,
  RPCMethod,
  EIP712AuthTypes,
} from '@erc7824/nitrolite';
import { logger as baseLogger } from '../../lib/logger.js';
import { AppError, ErrorCode } from '../../lib/errors.js';
import { withTimeout } from '../../utils/retry.js';
import type { Signer } from '../../kms/types.js';

const logger = baseLogger.child({ module: 'yellow' });

// ── Types ───────────────────────────────────────────────────────────────────

export interface YellowClientConfig {
  wssUrl: string;
  application: string;
  connectionTimeoutMs?: number;
  requestTimeoutMs?: number;
  maxReconnectAttempts?: number;
  reconnectIntervalMs?: number;
}

export interface Allowance {
  asset: string;
  amount: string;
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeout: ReturnType<typeof setTimeout>;
}

// ── YellowClient ────────────────────────────────────────────────────────────

export class YellowClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private isAuthenticated = false;
  private reconnectAttempts = 0;
  private requestMap = new Map<number, PendingRequest>();
  private readonly config: Required<YellowClientConfig>;

  constructor(config: YellowClientConfig) {
    super();
    this.config = {
      connectionTimeoutMs: 10_000,
      requestTimeoutMs: 30_000,
      maxReconnectAttempts: 5,
      reconnectIntervalMs: 3_000,
      ...config,
    };
  }

  // ── Connection lifecycle ────────────────────────────────────────────────

  async connect(): Promise<void> {
    return withTimeout(
      new Promise<void>((resolve, reject) => {
        logger.info({ url: this.config.wssUrl }, 'Connecting to ClearNode');

        this.ws = new WebSocket(this.config.wssUrl);

        this.ws.on('open', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          logger.info('ClearNode WebSocket connected');
          this.emit('connected');
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data);
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
          logger.info(
            { code, reason: reason.toString() },
            'ClearNode WebSocket closed',
          );
          this.isConnected = false;
          this.isAuthenticated = false;
          this.rejectAllPending('Connection closed');
          this.emit('disconnected', { code, reason: reason.toString() });

          if (code !== 1000) {
            this.attemptReconnect();
          }
        });

        this.ws.on('error', (err: Error) => {
          logger.error({ err }, 'ClearNode WebSocket error');
          this.emit('error', err);
          if (!this.isConnected) reject(err);
        });
      }),
      this.config.connectionTimeoutMs,
      'ClearNode connection timeout',
    );
  }

  disconnect(): void {
    this.rejectAllPending('User initiated disconnect');

    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.isAuthenticated = false;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      logger.error('Maximum reconnection attempts reached');
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay =
      this.config.reconnectIntervalMs *
      Math.pow(2, this.reconnectAttempts - 1);

    logger.info(
      { attempt: this.reconnectAttempts, delayMs: delay },
      'Reconnecting to ClearNode',
    );

    setTimeout(() => {
      this.connect().catch((err: unknown) =>
        logger.error({ err }, 'Reconnection failed'),
      );
    }, delay);
  }

  // ── Authentication (EIP-712 challenge-response) ─────────────────────────

  async authenticate(
    walletAddress: string,
    signer: Signer,
    options?: {
      scope?: string;
      allowances?: Allowance[];
      expiresAt?: number;
    },
  ): Promise<void> {
    if (!this.isConnected || !this.ws) {
      throw new AppError(ErrorCode.CONNECTION_FAILED, 'Not connected to ClearNode');
    }

    const scope = options?.scope ?? 'console';
    const allowances = options?.allowances ?? [];
    const expiresAt =
      options?.expiresAt ??
      Math.floor(Date.now() / 1000) + 3600;

    const sessionKeyAddress = signer.getAddress();

    // Step 1: Send auth_request
    const authRequestPayload = [
      {
        wallet: walletAddress,
        session_key: sessionKeyAddress,
        application: this.config.application,
        scope,
        allowances,
        expires_at: expiresAt.toString(),
      },
    ];

    const authResponse = await this.sendRequest(
      RPCMethod.AuthRequest,
      authRequestPayload,
      signer,
    );

    // Step 2: Extract challenge nonce from auth_challenge
    const challengeData = authResponse?.res?.[2]?.[0];
    const challenge = challengeData?.challenge ?? challengeData;

    if (!challenge) {
      throw new AppError(ErrorCode.AUTH_FAILED, 'No challenge received from ClearNode');
    }

    // Step 3: Sign challenge with EIP-712 and send auth_verify
    const signature = await signer.signTypedData(
      { name: this.config.application },
      EIP712AuthTypes,
      {
        challenge: String(challenge),
        scope,
        wallet: walletAddress as `0x${string}`,
        session_key: sessionKeyAddress as `0x${string}`,
        expires_at: BigInt(expiresAt),
        allowances,
      },
    );

    const verifyPayload = [{ signature }];
    const verifyResponse = await this.sendRequest(
      RPCMethod.AuthVerify,
      verifyPayload,
      signer,
    );

    this.isAuthenticated = true;
    logger.info({ walletAddress, sessionKeyAddress }, 'ClearNode authenticated');
    this.emit('authenticated');
  }

  // ── RPC helpers ─────────────────────────────────────────────────────────

  async sendRequest(
    method: string,
    params: unknown[],
    signer: Signer,
  ): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new AppError(ErrorCode.CONNECTION_FAILED, 'WebSocket not connected');
    }

    // Create the RPC message using the SDK (static methods)
    const message = NitroliteRPC.createRequest({
      method,
      params,
    } as any);

    const requestId = message.req![0] as number;

    // Sign following STATE-02 pattern: keccak256(JSON.stringify(req)), raw sign
    const payload = message.req!;
    const hash = keccak256(toBytes(JSON.stringify(payload))) as `0x${string}`;
    const sig = await signer.signRaw(hash);
    (message as any).sig = [sig];

    return withTimeout(
      new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.requestMap.delete(requestId);
          reject(
            new AppError(
              ErrorCode.TIMEOUT,
              `Request timeout for ${method} (id: ${requestId})`,
            ),
          );
        }, this.config.requestTimeoutMs);

        this.requestMap.set(requestId, { resolve, reject, timeout });
        this.ws!.send(JSON.stringify(message));
      }),
      this.config.requestTimeoutMs + 1000,
      `Request ${method} timed out`,
    );
  }

  // ── Session / Channel operations ────────────────────────────────────────

  async createAppSession(
    signer: Signer,
    params: {
      protocol: string;
      participants: string[];
      weights: number[];
      quorum: number;
      challenge: number;
      nonce: number;
      allocations: Array<{
        participant: string;
        asset: string;
        amount: string;
      }>;
    },
  ): Promise<{ appSessionId: string; status: string }> {
    const response = await this.sendRequest(
      RPCMethod.CreateAppSession,
      [
        {
          definition: {
            protocol: params.protocol,
            participants: params.participants,
            weights: params.weights,
            quorum: params.quorum,
            challenge: params.challenge,
            nonce: params.nonce,
          },
          allocations: params.allocations,
        },
      ],
      signer,
    );

    const result = response?.res?.[2]?.[0];
    return {
      appSessionId: result?.app_session_id ?? '',
      status: result?.status ?? 'unknown',
    };
  }

  async closeAppSession(
    signer: Signer,
    appSessionId: string,
    finalAllocations: Array<{
      participant: string;
      asset: string;
      amount: string;
    }>,
  ): Promise<{ status: string }> {
    const response = await this.sendRequest(
      RPCMethod.CloseAppSession,
      [{ app_session_id: appSessionId, allocations: finalAllocations }],
      signer,
    );

    const result = response?.res?.[2]?.[0];
    return { status: result?.status ?? 'unknown' };
  }

  async getLedgerBalances(
    signer: Signer,
    participant: string,
  ): Promise<Array<{ asset: string; amount: string }>> {
    const response = await this.sendRequest(
      RPCMethod.GetLedgerBalances,
      [{ participant }],
      signer,
    );

    return response?.res?.[2]?.[0] ?? [];
  }

  async getChannels(
    signer: Signer,
    participant: string,
  ): Promise<any[]> {
    const response = await this.sendRequest(
      RPCMethod.GetChannels,
      [{ participant }],
      signer,
    );

    return response?.res?.[2]?.[0] ?? [];
  }

  async submitAppState(
    signer: Signer,
    appSessionId: string,
    allocations: Array<{
      participant: string;
      asset: string;
      amount: string;
    }>,
    intent?: string,
  ): Promise<any> {
    return this.sendRequest(
      RPCMethod.SubmitAppState,
      [
        {
          app_session_id: appSessionId,
          allocations,
          ...(intent ? { intent } : {}),
        },
      ],
      signer,
    );
  }

  // ── Message handling ────────────────────────────────────────────────────

  private handleMessage(data: WebSocket.Data): void {
    let message: any;
    try {
      message = JSON.parse(data.toString());
    } catch {
      logger.warn('Received invalid JSON from ClearNode');
      return;
    }

    // Handle server-push events (bu, cu, asu, tr, etc.)
    if (message.res) {
      const [requestId, method] = message.res;

      // Check if this is a response to a pending request
      const handler = this.requestMap.get(requestId);
      if (handler) {
        clearTimeout(handler.timeout);
        handler.resolve(message);
        this.requestMap.delete(requestId);
        return;
      }

      // Server-initiated push
      this.emit(method, message);

      // Emit specific events for balance/channel updates
      if (method === RPCMethod.BalanceUpdate) {
        this.emit('balance_update', message.res[2]);
      }
      if (method === RPCMethod.ChannelUpdate) {
        this.emit('channel_update', message.res[2]);
      }
    }

    // Handle error responses
    if (message.err) {
      const [requestId, errorCode, errorMessage] = message.err;

      const handler = this.requestMap.get(requestId);
      if (handler) {
        clearTimeout(handler.timeout);
        handler.reject(
          new AppError(
            ErrorCode.AUTH_FAILED,
            `ClearNode RPC error [${errorCode}]: ${errorMessage}`,
          ),
        );
        this.requestMap.delete(requestId);
      }

      logger.warn({ requestId, errorCode, errorMessage }, 'ClearNode RPC error');
    }
  }

  private rejectAllPending(reason: string): void {
    for (const [id, handler] of this.requestMap.entries()) {
      clearTimeout(handler.timeout);
      handler.reject(new Error(reason));
      this.requestMap.delete(id);
    }
  }

  // ── Getters ─────────────────────────────────────────────────────────────

  get connected(): boolean {
    return this.isConnected;
  }

  get authenticated(): boolean {
    return this.isAuthenticated;
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

let _client: YellowClient | undefined;

export function getYellowClient(): YellowClient {
  if (!_client) {
    const wssUrl = process.env['CLEARNODE_WSS_URL'] ?? 'wss://clearnet.yellow.com/ws';
    const application = process.env['CLEARNODE_APPLICATION'] ?? 'Flywheel';

    _client = new YellowClient({ wssUrl, application });
  }
  return _client;
}

export function setYellowClient(client: YellowClient): void {
  _client = client;
}

export function resetYellowClient(): void {
  _client?.disconnect();
  _client = undefined;
}
