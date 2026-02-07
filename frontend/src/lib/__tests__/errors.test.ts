import { getErrorMessage } from '../errors';

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
});
