import { useDelegationStore } from '../delegationStore';

describe('delegationStore', () => {
  beforeEach(() => {
    useDelegationStore.setState({
      status: 'none',
      sessionKeyAddress: null,
      scope: null,
      expiresAt: null,
    });
  });

  it('starts with no delegation', () => {
    const state = useDelegationStore.getState();
    expect(state.status).toBe('none');
    expect(state.sessionKeyAddress).toBeNull();
    expect(state.scope).toBeNull();
    expect(state.expiresAt).toBeNull();
  });

  it('sets active delegation', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 86400;
    useDelegationStore
      .getState()
      .setActive('0xabcdef1234567890abcdef1234567890abcdef12', 'liquidity', futureTimestamp);
    const state = useDelegationStore.getState();
    expect(state.status).toBe('active');
    expect(state.sessionKeyAddress).toBe('0xabcdef1234567890abcdef1234567890abcdef12');
    expect(state.scope).toBe('liquidity');
    expect(state.expiresAt).toBe(futureTimestamp);
  });

  it('clears delegation', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 86400;
    useDelegationStore
      .getState()
      .setActive('0xabcdef1234567890abcdef1234567890abcdef12', 'liquidity', futureTimestamp);
    useDelegationStore.getState().clear();
    const state = useDelegationStore.getState();
    expect(state.status).toBe('none');
    expect(state.sessionKeyAddress).toBeNull();
  });

  it('hasActiveDelegation returns true when active and not expired', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 86400;
    useDelegationStore
      .getState()
      .setActive('0xabcdef1234567890abcdef1234567890abcdef12', 'liquidity', futureTimestamp);
    expect(useDelegationStore.getState().hasActiveDelegation()).toBe(true);
  });

  it('hasActiveDelegation returns false when expired', () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 86400;
    useDelegationStore
      .getState()
      .setActive('0xabcdef1234567890abcdef1234567890abcdef12', 'liquidity', pastTimestamp);
    expect(useDelegationStore.getState().hasActiveDelegation()).toBe(false);
  });

  it('hasActiveDelegation returns false when status is none', () => {
    expect(useDelegationStore.getState().hasActiveDelegation()).toBe(false);
  });
});
