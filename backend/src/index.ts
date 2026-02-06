/**
 * UXWallet Backend — Entry point.
 *
 * Boots Express HTTP server + WebSocket server, connects to Postgres & Redis,
 * and starts all background services (solver, rebalancer, etc.).
 */
import { config } from "./config/index.js";
import { logger } from "./lib/logger.js";
import { connectDatabase, disconnectDatabase } from "./lib/prisma.js";
import { connectRedis, disconnectRedis } from "./lib/redis.js";
import { createApp } from "./app.js";
import { createWebSocketServer } from "./websocket/server.js";
import http from "node:http";

async function main(): Promise<void> {
  logger.info(
    { env: config.nodeEnv, port: config.port },
    "Starting UXWallet Backend…",
  );

  // Connect infrastructure
  await connectDatabase();
  await connectRedis();

  // Create Express app + HTTP server
  const app = createApp();
  const server = http.createServer(app);

  // Attach WebSocket server
  createWebSocketServer(server);

  // Start listening
  server.listen(config.port, () => {
    logger.info({ port: config.port }, "Server listening");
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down…");
    server.close();
    await disconnectRedis();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start");
  process.exit(1);
});
