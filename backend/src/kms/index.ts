import { generatePrivateKey } from 'viem/accounts';
import type { Hex } from 'viem';
import { LocalSigner } from './localSigner.js';
import type { Signer } from './types.js';
import { logger } from '../lib/logger.js';

export type { Signer } from './types.js';

let _solverSigner: Signer | undefined;

/**
 * Get (or lazily create) the Flywheel Solver signer.
 *
 * If `SOLVER_PRIVATE_KEY` is empty, a random key is generated for development.
 */
export function getSolverSigner(): Signer {
  if (!_solverSigner) {
    let pk = process.env['SOLVER_PRIVATE_KEY'] as Hex | undefined;

    if (!pk || pk.length < 10) {
      pk = generatePrivateKey();
      logger.warn(
        'No SOLVER_PRIVATE_KEY configured — generated ephemeral key. DO NOT use in production.',
      );
    }

    _solverSigner = new LocalSigner(pk);
    logger.info(
      { address: _solverSigner.getAddress() },
      'Solver signer initialised',
    );
  }

  return _solverSigner;
}

/**
 * Create a new random session key signer.
 */
export function createSessionKeySigner(): Signer {
  const pk = generatePrivateKey();
  return new LocalSigner(pk);
}

/** Reset cached signer — for tests. */
export function resetSolverSigner(): void {
  _solverSigner = undefined;
}
