/**
 * k6 Load Test - WebSocket Concurrent Connections
 *
 * Targets: 1000+ simultaneous WebSocket connections receiving `bu` notifications.
 *
 * Run: k6 run tests/load/k6-websocket.js
 */
import ws from "k6/ws";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("ws_errors");

export const options = {
  stages: [
    { duration: "30s", target: 200 },
    { duration: "1m", target: 500 },
    { duration: "2m", target: 1000 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    ws_errors: ["rate<0.05"],  // <5% error rate
  },
};

const WS_URL = __ENV.WS_URL || "ws://localhost:3001/ws";

export default function () {
  const address = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, "0")}`;

  const res = ws.connect(`${WS_URL}?address=${address}`, {}, function (socket) {
    socket.on("open", () => {
      // Connection established
    });

    socket.on("message", (msg) => {
      const data = JSON.parse(msg);
      check(data, {
        "message has type": (d) => d.type !== undefined,
      });
    });

    socket.on("error", (e) => {
      errorRate.add(1);
    });

    // Keep connection alive for test duration
    sleep(10);

    socket.close();
  });

  check(res, {
    "ws status is 101": (r) => r && r.status === 101,
  });
}
