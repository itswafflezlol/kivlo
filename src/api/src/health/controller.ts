import { Hono } from "hono";
import type { AppEnv } from "../shared/env.js";
import { sql } from "../shared/db.js";
import { logger } from "../shared/logger.js";

export const healthController = new Hono<AppEnv>();

healthController.get("/health", (c) => c.json({ status: "ok" }));

healthController.get("/ready", async (c) => {
  try {
    await sql`select 1`;
    return c.json({ status: "ready" });
  } catch (e) {
    logger.error({ err: String(e) }, "readiness check failed");
    return c.json({ status: "degraded" }, 503);
  }
});
