import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { logger } from "./shared/logger.js";
import { closeDb } from "./shared/db.js";
import { startNotifyFanout } from "./events/service.js";

const app = createApp();

const server = serve({ fetch: app.fetch, port: config.PORT }, (info) => {
  logger.info({ port: info.port }, "kivlo-api listening");
});

await startNotifyFanout();

let closing = false;
async function shutdown(signal: string) {
  if (closing) return;
  closing = true;
  logger.info({ signal }, "shutting down");
  server.close(); // stop accepting; in-flight requests finish
  await new Promise((r) => setTimeout(r, 500)); // let SSE streams close out
  await closeDb().catch(() => {});
  process.exit(0);
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
