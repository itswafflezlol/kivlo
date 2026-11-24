import type { Context, Next } from "hono";
import { randomUUID } from "node:crypto";
import { logger } from "./logger.js";
import { RateLimitError } from "./errors.js";
import { config } from "../config.js";

export async function requestId(c: Context, next: Next) {
  const id = c.req.header("x-request-id") ?? randomUUID();
  c.set("requestId", id);
  c.header("x-request-id", id);
  await next();
}

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  await next();
  logger.info({
    request_id: c.get("requestId"),
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    ms: Date.now() - start,
    user: (c.get("user") as { id: string } | undefined)?.id,
  }, "request");
}

const ALLOWED = new Set(config.CORS_ORIGINS);
export async function cors(c: Context, next: Next) {
  const origin = c.req.header("origin");
  if (origin && ALLOWED.has(origin)) {
    c.header("access-control-allow-origin", origin);
    c.header("vary", "origin");
    c.header("access-control-allow-methods", "GET,POST,PATCH,DELETE,OPTIONS");
    c.header("access-control-allow-headers", "authorization,content-type,idempotency-key,x-request-id");
    c.header("access-control-max-age", "600");
  }
  if (c.req.method === "OPTIONS") return c.body(null, 204);
  await next();
}

export async function secureHeaders(c: Context, next: Next) {
  c.header("x-content-type-options", "nosniff");
  c.header("x-frame-options", "DENY");
  c.header("referrer-policy", "no-referrer");
  c.header("permissions-policy", "camera=(), microphone=(), geolocation=()");
  await next();
}

// shortcut: single-node in-memory bucket is fine on one VPS; move to Redis or an
// upstream limiter (Cloudflare) when running more than one API instance.
const buckets = new Map<string, { tokens: number; ts: number }>();
const LIMIT = 120; // requests
const WINDOW_MS = 60_000;

export async function rateLimit(c: Context, next: Next) {
  const user = c.get("user") as { id: string } | undefined;
  const key = user?.id ?? c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "anon";
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.ts > WINDOW_MS) { b = { tokens: LIMIT, ts: now }; buckets.set(key, b); }
  if (--b.tokens < 0) throw new RateLimitError();
  await next();
}
