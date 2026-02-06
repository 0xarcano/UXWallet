/**
 * k6 load test for ClearNode RPC endpoints.
 *
 * Run: k6 run tests/load/k6-clearnode-rpc.js
 *
 * Prerequisites:
 *   - Backend running on http://localhost:3000
 *   - Database seeded with test data
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // ramp up
    { duration: '1m', target: 200 },    // hold
    { duration: '30s', target: 1000 },  // peak
    { duration: '30s', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95 % under 500 ms
    http_req_failed: ['rate<0.01'],   // < 1 % errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const USER_ADDRESS = '0x' + 'a'.repeat(40);

export default function () {
  // Health check
  const health = http.get(`${BASE_URL}/api/health`);
  check(health, {
    'health 200': (r) => r.status === 200,
  });

  // Balance query
  const balance = http.get(
    `${BASE_URL}/api/balance?userAddress=${USER_ADDRESS}`,
  );
  check(balance, {
    'balance 200': (r) => r.status === 200,
    'has balances': (r) => JSON.parse(r.body).balances !== undefined,
  });

  sleep(0.1);
}
