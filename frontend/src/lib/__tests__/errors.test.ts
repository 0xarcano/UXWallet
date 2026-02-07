import { getErrorMessage } from '../errors';
import type { ErrorMessage } from '../errors';

describe('getErrorMessage', () => {
  it('returns mapped message for known error codes', () => {
    const msg = getErrorMessage('INSUFFICIENT_FUNDS');
    expect(msg.title).toBe('Insufficient Funds');
    expect(msg.body).toContain('balance is too low');
    expect(msg.action).toBeDefined();
  });

  it('returns session key expired message', () => {
    const msg = getErrorMessage('SESSION_KEY_EXPIRED');
    expect(msg.title).toBe('Delegation Expired');
    expect(msg.action).toContain('Re-delegate');
  });

  it('returns unknown message for unmapped codes', () => {
    const msg = getErrorMessage('NEVER_SEEN_BEFORE');
    expect(msg.title).toBe('Something Went Wrong');
  });

  it('returns unknown message when code is undefined', () => {
    const msg = getErrorMessage(undefined);
    expect(msg.title).toBe('Something Went Wrong');
  });

  it('returns unknown message when code is empty string', () => {
    const msg = getErrorMessage('');
    expect(msg.title).toBe('Something Went Wrong');
  });

  it('returns network error message', () => {
    const msg = getErrorMessage('NETWORK_ERROR');
    expect(msg.title).toBe('Connection Issue');
    expect(msg.action).toBeDefined();
  });

  // New error codes from API spec
  it('returns validation error message', () => {
    const msg = getErrorMessage('VALIDATION_ERROR');
    expect(msg.title).toBe('Invalid Input');
  });

  it('returns not found message', () => {
    const msg = getErrorMessage('NOT_FOUND');
    expect(msg.title).toBe('Not Found');
  });

  it('returns unauthorized message', () => {
    const msg = getErrorMessage('UNAUTHORIZED');
    expect(msg.title).toBe('Authentication Required');
  });

  it('returns auth failed message', () => {
    const msg = getErrorMessage('AUTH_FAILED');
    expect(msg.title).toBe('Authentication Failed');
  });

  it('returns session not found message', () => {
    const msg = getErrorMessage('SESSION_NOT_FOUND');
    expect(msg.title).toBe('Session Not Found');
  });

  it('returns session expired message', () => {
    const msg = getErrorMessage('SESSION_EXPIRED');
    expect(msg.title).toBe('Session Expired');
  });

  it('returns session key invalid message', () => {
    const msg = getErrorMessage('SESSION_KEY_INVALID');
    expect(msg.title).toBe('Invalid Session Key');
  });

  it('returns session key revoked message', () => {
    const msg = getErrorMessage('SESSION_KEY_REVOKED');
    expect(msg.title).toBe('Delegation Revoked');
  });

  it('returns insufficient liquidity message', () => {
    const msg = getErrorMessage('INSUFFICIENT_LIQUIDITY');
    expect(msg.title).toBe('Pool Temporarily Low');
  });

  it('returns stale state message', () => {
    const msg = getErrorMessage('STALE_STATE');
    expect(msg.title).toBe('State Conflict');
  });

  it('returns invalid signature message', () => {
    const msg = getErrorMessage('INVALID_SIGNATURE');
    expect(msg.title).toBe('Invalid Signature');
  });

  it('returns allocation mismatch message', () => {
    const msg = getErrorMessage('ALLOCATION_MISMATCH');
    expect(msg.title).toBe('Allocation Error');
  });

  it('returns withdrawal pending message', () => {
    const msg = getErrorMessage('WITHDRAWAL_PENDING');
    expect(msg.title).toBe('Withdrawal In Progress');
  });

  it('returns internal error message', () => {
    const msg = getErrorMessage('INTERNAL_ERROR');
    expect(msg.title).toBe('Server Error');
  });

  it('returns timeout message', () => {
    const msg = getErrorMessage('TIMEOUT');
    expect(msg.title).toBe('Request Timeout');
  });

  it('returns connection failed message', () => {
    const msg = getErrorMessage('CONNECTION_FAILED');
    expect(msg.title).toBe('Connection Failed');
  });

  it('ErrorMessage type is exported', () => {
    const msg: ErrorMessage = getErrorMessage('UNKNOWN');
    expect(msg.title).toBeDefined();
    expect(msg.body).toBeDefined();
  });
});
