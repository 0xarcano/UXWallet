import type { FastifyPluginAsync } from 'fastify';
import type { WebSocket } from 'ws';
import { getRedis } from '../lib/redis.js';
import { createLogger } from '../lib/logger.js';

const BU_CHANNEL = 'flywheel:bu';
const logger = createLogger('websocket');

/** Connected WS clients keyed by a request-generated ID. */
const clients = new Map<string, { ws: WebSocket; subscriptions: Set<string> }>();

// ── Fastify plugin ──────────────────────────────────────────────────────────

export const registerWebSocket: FastifyPluginAsync = async (app) => {
  app.get('/ws', { websocket: true }, (socket, request) => {
    const clientId = request.id;
    const log = logger.child({ clientId });

    clients.set(clientId, { ws: socket, subscriptions: new Set() });
    log.info('WebSocket client connected');

    socket.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        handleClientMessage(clientId, msg);
      } catch {
        socket.send(
          JSON.stringify({
            error: { code: 'PARSE_ERROR', message: 'Invalid JSON' },
          }),
        );
      }
    });

    socket.on('close', () => {
      clients.delete(clientId);
      log.info('WebSocket client disconnected');
    });

    socket.on('error', (err: Error) => {
      log.error({ err }, 'WebSocket error');
      clients.delete(clientId);
    });
  });

  // ── Redis pub/sub subscriber ────────────────────────────────────────────
  const sub = getRedis().duplicate();
  await sub.subscribe(BU_CHANNEL);

  sub.on('message', (_channel: string, message: string) => {
    // Parse once, route to subscribed clients
    let parsed: { type: string; data: { userAddress?: string } } | undefined;
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }

    for (const [, client] of clients) {
      if (client.ws.readyState !== 1) continue; // 1 = OPEN

      // If client has subscriptions, only forward matching messages
      if (
        client.subscriptions.size > 0 &&
        parsed?.data?.userAddress &&
        !client.subscriptions.has(parsed.data.userAddress.toLowerCase())
      ) {
        continue;
      }

      client.ws.send(message);
    }
  });

  // Clean up subscriber on server close
  app.addHook('onClose', async () => {
    await sub.unsubscribe(BU_CHANNEL);
    sub.disconnect();
  });
};

// ── Client message handler ──────────────────────────────────────────────────

function handleClientMessage(
  clientId: string,
  msg: Record<string, unknown>,
): void {
  const client = clients.get(clientId);
  if (!client) return;

  const { ws } = client;

  switch (msg['type']) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;

    case 'subscribe': {
      const addr = msg['userAddress'];
      if (typeof addr === 'string' && /^0x[a-fA-F0-9]{40}$/.test(addr)) {
        client.subscriptions.add(addr.toLowerCase());
        logger.info({ clientId, userAddress: addr }, 'Client subscribed');
        ws.send(
          JSON.stringify({ type: 'subscribed', userAddress: addr }),
        );
      } else {
        ws.send(
          JSON.stringify({
            error: { code: 'VALIDATION_ERROR', message: 'Invalid userAddress' },
          }),
        );
      }
      break;
    }

    case 'unsubscribe': {
      const addr = msg['userAddress'];
      if (typeof addr === 'string') {
        client.subscriptions.delete(addr.toLowerCase());
        ws.send(
          JSON.stringify({ type: 'unsubscribed', userAddress: addr }),
        );
      }
      break;
    }

    default:
      ws.send(
        JSON.stringify({
          error: { code: 'UNKNOWN_MESSAGE', message: 'Unknown message type' },
        }),
      );
  }
}

// ── Publishing helper ───────────────────────────────────────────────────────

/**
 * Publish a balance update (`bu`) event via Redis pub/sub.
 * All connected WebSocket clients subscribed to this user will receive it.
 */
export async function publishBalanceUpdate(data: {
  userAddress: string;
  asset: string;
  balance: string;
  chainId?: number;
}): Promise<void> {
  const redis = getRedis();
  const message = JSON.stringify({
    type: 'bu',
    data,
    timestamp: Date.now(),
  });
  await redis.publish(BU_CHANNEL, message);
}
