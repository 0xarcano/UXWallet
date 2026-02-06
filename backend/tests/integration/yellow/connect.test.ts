import { describe, it, expect, afterEach } from 'vitest';
import {
  YellowClient,
  resetYellowClient,
} from '../../../src/integrations/yellow/client.js';
import { getConfig } from '../../../src/config/index.js';
import { getSolverSigner, resetSolverSigner } from '../../../src/kms/index.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

function getClearNodeConfig() {
  const config = getConfig();
  return { wssUrl: config.CLEARNODE_WSS_URL, application: config.CLEARNODE_APPLICATION };
}

/** Skip auth/RPC tests when no solver key is configured (e.g. CI). */
const hasSolverKey = () =>
  Boolean(
    process.env['SOLVER_PRIVATE_KEY'] &&
      process.env['SOLVER_PRIVATE_KEY']!.length >= 10,
  );

// ── Yellow ClearNode connectivity (real testnet) ────────────────────────────
// Uses CLEARNODE_WSS_URL and CLEARNODE_APPLICATION from .env (via getConfig()).

describe('Yellow ClearNode connectivity (sandbox)', () => {
  let client: YellowClient;

  afterEach(() => {
    // Always disconnect to avoid dangling sockets
    try {
      client?.disconnect();
    } catch {
      // ignore
    }
    resetYellowClient();
  });

  it('connects to ClearNode sandbox and reports connected', async () => {
    const { wssUrl, application } = getClearNodeConfig();
    client = new YellowClient({
      wssUrl,
      application,
      connectionTimeoutMs: 15_000,
    });

    await client.connect();

    expect(client.connected).toBe(true);
    expect(client.authenticated).toBe(false);
  });

  it('disconnects cleanly after connecting', async () => {
    const { wssUrl, application } = getClearNodeConfig();
    client = new YellowClient({
      wssUrl,
      application,
      connectionTimeoutMs: 15_000,
    });

    await client.connect();
    expect(client.connected).toBe(true);

    client.disconnect();
    expect(client.connected).toBe(false);
  });

  it('emits "connected" event on successful connection', async () => {
    const { wssUrl, application } = getClearNodeConfig();
    client = new YellowClient({
      wssUrl,
      application,
      connectionTimeoutMs: 15_000,
    });

    const connectedPromise = new Promise<void>((resolve) => {
      client.on('connected', resolve);
    });

    await client.connect();
    await connectedPromise;

    expect(client.connected).toBe(true);
  });

  it('rejects with timeout for an unreachable URL', async () => {
    const { application } = getClearNodeConfig();
    client = new YellowClient({
      wssUrl: 'wss://localhost:19999/ws',
      application,
      connectionTimeoutMs: 3_000,
      maxReconnectAttempts: 0,
    });

    // Suppress the EventEmitter 'error' that YellowClient emits so it
    // doesn't surface as an uncaught exception in the test runner.
    client.on('error', () => {});

    await expect(client.connect()).rejects.toThrow();
    expect(client.connected).toBe(false);
  });
});

// ── Yellow ClearNode authentication and RPC (sandbox) ───────────────────────
// These tests require SOLVER_PRIVATE_KEY in .env and run against the real sandbox.
// Skipped when SOLVER_PRIVATE_KEY is unset so CI without a key still passes.

describe.skipIf(!hasSolverKey())(
  'Yellow ClearNode authentication and RPC (sandbox)',
  () => {
    let client: YellowClient;

    afterEach(() => {
      try {
        client?.disconnect();
      } catch {
        // ignore
      }
      resetYellowClient();
      resetSolverSigner();
    });

    it('authenticates with solver signer and reports authenticated', async () => {
      const { wssUrl, application } = getClearNodeConfig();
      client = new YellowClient({
        wssUrl,
        application,
        connectionTimeoutMs: 15_000,
      });

      await client.connect();
      expect(client.connected).toBe(true);
      expect(client.authenticated).toBe(false);

      const signer = getSolverSigner();
      const solverAddress = signer.getAddress();
      await client.authenticate(solverAddress, signer);

      expect(client.authenticated).toBe(true);
    });

    it('calls getChannels RPC after authentication', async () => {
      const { wssUrl, application } = getClearNodeConfig();
      client = new YellowClient({
        wssUrl,
        application,
        connectionTimeoutMs: 15_000,
      });

      await client.connect();
      const signer = getSolverSigner();
      const solverAddress = signer.getAddress();
      await client.authenticate(solverAddress, signer);

      const channels = await client.getChannels(signer, solverAddress);

      expect(Array.isArray(channels)).toBe(true);
    });
  },
);
