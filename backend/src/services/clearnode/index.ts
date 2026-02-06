import { getPrisma, type PrismaClient } from '../../lib/prisma.js';
import { logger as baseLogger } from '../../lib/logger.js';
import { AppError, ErrorCode } from '../../lib/errors.js';
import {
  getYellowClient,
  type YellowClient,
} from '../../integrations/yellow/client.js';
import { getSolverSigner, type Signer } from '../../kms/index.js';
import { publishBalanceUpdate } from '../../websocket/server.js';

const logger = baseLogger.child({ module: 'clearnode' });

// ── Service ─────────────────────────────────────────────────────────────────

export class ClearNodeService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly yellowClient: YellowClient,
    private readonly signer: Signer,
  ) {}

  /**
   * Initialize a session: connect to ClearNode, authenticate,
   * and open a state channel.
   */
  async initializeSession(params: {
    userAddress: string;
    chainId: number;
    depositAmount: string;
    asset: string;
  }): Promise<{ sessionId: string; channelId: string }> {
    const { userAddress, chainId, depositAmount, asset } = params;
    const solverAddress = this.signer.getAddress();

    // Ensure connected & authenticated
    if (!this.yellowClient.connected) {
      await this.yellowClient.connect();
    }
    if (!this.yellowClient.authenticated) {
      await this.yellowClient.authenticate(solverAddress, this.signer);
    }

    // Create app session via ClearNode RPC
    const appSession = await this.yellowClient.createAppSession(this.signer, {
      protocol: 'nitroliterpc',
      participants: [userAddress.toLowerCase(), solverAddress.toLowerCase()],
      weights: [100, 0], // User-controlled (for delegation)
      quorum: 100,
      challenge: 0,
      nonce: Date.now(),
      allocations: [
        {
          participant: userAddress.toLowerCase(),
          asset: asset.toLowerCase(),
          amount: depositAmount,
        },
        {
          participant: solverAddress.toLowerCase(),
          asset: asset.toLowerCase(),
          amount: '0',
        },
      ],
    });

    // Persist session to DB
    const session = await this.prisma.session.create({
      data: {
        channelId: appSession.appSessionId,
        participantA: userAddress.toLowerCase(),
        participantB: solverAddress.toLowerCase(),
        chainId,
        status: 'OPEN',
        totalLocked: depositAmount,
        appSessionId: appSession.appSessionId,
        latestState: {
          allocations: [
            { participant: userAddress.toLowerCase(), asset, amount: depositAmount },
            { participant: solverAddress.toLowerCase(), asset, amount: '0' },
          ],
        },
      },
    });

    // Record initial transaction
    await this.prisma.transaction.create({
      data: {
        sessionId: session.id,
        nonce: 0,
        stateData: session.latestState!,
        signature: '',
        type: 'DEPOSIT',
      },
    });

    // Update user balance (unified)
    await this.prisma.userBalance.upsert({
      where: {
        userAddress_asset_chainId: {
          userAddress: userAddress.toLowerCase(),
          asset: asset.toLowerCase(),
          chainId: null as any,
        },
      },
      update: {
        balance: depositAmount, // In MVP, set directly
      },
      create: {
        userAddress: userAddress.toLowerCase(),
        asset: asset.toLowerCase(),
        balance: depositAmount,
        chainId: null,
      },
    });

    // Emit balance update
    await publishBalanceUpdate({
      userAddress: userAddress.toLowerCase(),
      asset: asset.toLowerCase(),
      balance: depositAmount,
      chainId,
    });

    logger.info(
      { sessionId: session.id, channelId: session.channelId, userAddress },
      'Session initialised',
    );

    return {
      sessionId: session.id,
      channelId: session.channelId,
    };
  }

  /**
   * Co-sign a state update from the user (ClearNode responsibility).
   */
  async submitStateUpdate(params: {
    channelId: string;
    allocations: Array<{
      participant: string;
      asset: string;
      amount: string;
    }>;
  }): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { channelId: params.channelId },
    });

    if (!session) {
      throw AppError.notFound('Session not found');
    }
    if (session.status !== 'OPEN') {
      throw new AppError(ErrorCode.SESSION_EXPIRED, 'Session is not open');
    }

    const newNonce = session.latestNonce + 1;

    // Submit to ClearNode
    if (session.appSessionId) {
      await this.yellowClient.submitAppState(
        this.signer,
        session.appSessionId,
        params.allocations,
      );
    }

    // Persist state update
    await this.prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: session.id },
        data: {
          latestState: { allocations: params.allocations },
          latestNonce: newNonce,
        },
      });

      await tx.transaction.create({
        data: {
          sessionId: session.id,
          nonce: newNonce,
          stateData: { allocations: params.allocations },
          signature: '',
          type: 'STATE_UPDATE',
        },
      });
    });

    logger.info(
      { channelId: params.channelId, nonce: newNonce },
      'State update submitted',
    );
  }

  /**
   * Fetch the on-chain / ClearNode balances for a participant.
   */
  async getLedgerBalances(
    participant: string,
  ): Promise<Array<{ asset: string; amount: string }>> {
    if (!this.yellowClient.authenticated) {
      logger.warn('ClearNode not authenticated, returning DB balances');
      const dbBalances = await this.prisma.userBalance.findMany({
        where: { userAddress: participant.toLowerCase() },
      });
      return dbBalances.map((b) => ({ asset: b.asset, amount: b.balance }));
    }

    return this.yellowClient.getLedgerBalances(this.signer, participant);
  }

  /**
   * Close a session and trigger on-chain withdrawal.
   */
  async closeSession(channelId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { channelId },
    });

    if (!session) throw AppError.notFound('Session not found');

    // Close on ClearNode
    if (session.appSessionId && this.yellowClient.authenticated) {
      const state = session.latestState as any;
      await this.yellowClient.closeAppSession(
        this.signer,
        session.appSessionId,
        state?.allocations ?? [],
      );
    }

    // Update DB
    await this.prisma.session.update({
      where: { id: session.id },
      data: { status: 'CLOSED' },
    });

    logger.info({ channelId }, 'Session closed');
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

let _service: ClearNodeService | undefined;

export function getClearNodeService(): ClearNodeService {
  if (!_service) {
    _service = new ClearNodeService(
      getPrisma(),
      getYellowClient(),
      getSolverSigner(),
    );
  }
  return _service;
}

export function resetClearNodeService(): void {
  _service = undefined;
}
