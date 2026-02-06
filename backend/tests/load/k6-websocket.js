/**
 * k6 load test for WebSocket balance-update (bu) notifications.
 *
 * Run: k6 run tests/load/k6-websocket.js
 *
 * Prerequisites:
 *   - Backend running on http://localhost:3000 (ws://localhost:3000/ws)
 */

import ws from 'k6/ws';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 500 },
    { duration: '1m', target: 1000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    ws_connecting: ['p(95)<1000'],
  },
};

const WS_URL = __ENV.WS_URL || 'ws://localhost:3000/ws';
const USER_ADDRESS = '0x' + 'a'.repeat(40);

export default function () {
  const res = ws.connect(WS_URL, {}, function (socket) {
    socket.on('open', function () {
      // Subscribe to balance updates
      socket.send(
        JSON.stringify({
          type: 'subscribe',
          userAddress: USER_ADDRESS,
        }),
      );
    });

    socket.on('message', function (message) {
      const data = JSON.parse(message);
      check(data, {
        'received message': (d) => d.type !== undefined,
      });
    });

    // Keep connection alive for a bit
    socket.setTimeout(function () {
      socket.send(JSON.stringify({ type: 'ping' }));
    }, 5000);

    socket.setTimeout(function () {
      socket.close();
    }, 15000);
  });

  check(res, {
    'ws status 101': (r) => r && r.status === 101,
  });

  sleep(1);
}
