import { HostRuntime } from "./runtime";
import { routeRequest } from "./http";

const port = Number(process.env.TORO_HOST_PORT ?? 17345);
const runtime = new HostRuntime();

Bun.serve({
  fetch: (request) => routeRequest(runtime, request),
  hostname: "127.0.0.1",
  idleTimeout: 255,
  port,
});

console.log(`Toro host listening on http://127.0.0.1:${port}`);
