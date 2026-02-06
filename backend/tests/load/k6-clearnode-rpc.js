/**
 * k6 Load Test - ClearNode RPC Endpoints
 *
 * Targets: 1000+ TPS for balance queries and state updates.
 *
 * Run: k6 run tests/load/k6-clearnode-rpc.js
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const balanceLatency = new Trend("balance_latency");

export const options = {
  stages: [
    { duration: "30s", target: 100 },   // ramp up to 100 VUs
    { duration: "1m", target: 500 },     // ramp up to 500 VUs
    { duration: "2m", target: 1000 },    // sustain 1000 VUs
    { duration: "30s", target: 0 },      // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"],     // 95th percentile < 200ms
    errors: ["rate<0.01"],                // <1% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const TEST_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

export default function () {
  // Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    "health status is 200": (r) => r.status === 200,
  });

  // Balance query
  const start = Date.now();
  const balanceRes = http.get(`${BASE_URL}/api/balance/${TEST_ADDRESS}`);
  balanceLatency.add(Date.now() - start);

  const balanceOk = check(balanceRes, {
    "balance status is 200": (r) => r.status === 200,
    "balance has data": (r) => JSON.parse(r.body).data !== undefined,
  });

  errorRate.add(!balanceOk);

  sleep(0.1); // 100ms between requests per VU
}
