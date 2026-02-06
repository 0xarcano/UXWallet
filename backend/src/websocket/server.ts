/**
 * WebSocket server — provides real-time `bu` (balance update) notifications.
 */
import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "node:http";
import { logger } from "../lib/logger.js";

/** Connected clients keyed by user address (lowercase). */
const clients = new Map<string, Set<WebSocket>>();

export function createWebSocketServer(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const address = url.searchParams.get("address")?.toLowerCase();

    if (!address) {
      ws.close(4001, "Missing address query parameter");
      return;
    }

    logger.info({ address }, "WebSocket client connected");

    // Register
    if (!clients.has(address)) {
      clients.set(address, new Set());
    }
    clients.get(address)!.add(ws);

    // Send welcome
    ws.send(JSON.stringify({ type: "connected", address }));

    ws.on("close", () => {
      clients.get(address)?.delete(ws);
      if (clients.get(address)?.size === 0) {
        clients.delete(address);
      }
      logger.debug({ address }, "WebSocket client disconnected");
    });

    ws.on("error", (err) => {
      logger.error({ err, address }, "WebSocket error");
    });
  });

  logger.info("WebSocket server attached on /ws");
  return wss;
}

/**
 * Broadcast a `bu` (balance update) notification to all connections for a given address.
 */
export function emitBalanceUpdate(
  userAddress: string,
  payload: Record<string, unknown>,
): void {
  const addr = userAddress.toLowerCase();
  const sockets = clients.get(addr);
  if (!sockets || sockets.size === 0) return;

  const message = JSON.stringify({ type: "bu", data: payload });
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

/**
 * Get connected client count (for monitoring).
 */
export function getConnectedClientCount(): number {
  let count = 0;
  for (const sockets of clients.values()) {
    count += sockets.size;
  }
  return count;
}
