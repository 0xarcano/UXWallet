import { useWebSocketStore } from '../webSocketStore';

describe('webSocketStore', () => {
  beforeEach(() => {
    useWebSocketStore.setState({ status: 'disconnected', lastUpdated: null });
  });

  it('starts disconnected', () => {
    const state = useWebSocketStore.getState();
    expect(state.status).toBe('disconnected');
    expect(state.lastUpdated).toBeNull();
  });

  it('sets connection status', () => {
    useWebSocketStore.getState().setStatus('connected');
    expect(useWebSocketStore.getState().status).toBe('connected');

    useWebSocketStore.getState().setStatus('reconnecting');
    expect(useWebSocketStore.getState().status).toBe('reconnecting');
  });

  it('sets lastUpdated timestamp', () => {
    const now = Date.now();
    useWebSocketStore.getState().setLastUpdated(now);
    expect(useWebSocketStore.getState().lastUpdated).toBe(now);
  });
});
