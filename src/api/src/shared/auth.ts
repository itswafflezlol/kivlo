import { createRemoteJWKSet, jwtVerify, SignJWT, importJWK, type JWTPayload } from "jose";
import type { Context, Next } from "hono";
import { config } from "../config.js";
import { UnauthorizedError } from "./errors.js";

export type AuthUser = { id: string };

const hsKey = config.SUPABASE_JWT_SECRET
  ? new TextEncoder().encode(config.SUPABASE_JWT_SECRET)
  : null;
const jwks = config.SUPABASE_JWKS_URL ? createRemoteJWKSet(new URL(config.SUPABASE_JWKS_URL)) : null;

async function verify(token: string): Promise<AuthUser> {
  if (config.DEV_AUTH && token === "dev") return { id: config.DEV_USER_ID };
  if (hsKey) {
    const { payload } = await jwtVerify(token, hsKey, { algorithms: ["HS256"] });
    if (payload.sub) return { id: payload.sub };
  }
  if (jwks) {
    const { payload } = await jwtVerify(token, jwks, { issuer: config.SUPABASE_URL ? `${config.SUPABASE_URL}/auth/v1` : undefined });
    if (payload.sub) return { id: payload.sub };
  }
  throw new UnauthorizedError("Invalid or expired token.");
}

export async function requireAuth(c: Context, next: Next) {
  const h = c.req.header("authorization") ?? "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) throw new UnauthorizedError();
  try {
    c.set("user", await verify(token));
  } catch (e) {
    if (e instanceof UnauthorizedError) throw e;
    throw new UnauthorizedError("Invalid or expired token.");
  }
  await next();
}

// ---- short-lived tickets for EventSource (can't send headers) ----
const ticketKey = () => hsKey ?? new TextEncoder().encode("dev-ticket-secret");

export async function issueTicket(userId: string): Promise<string> {
  return new SignJWT({ purpose: "events" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(ticketKey());
}

export async function verifyTicket(ticket: string): Promise<AuthUser> {
  try {
    const { payload } = await jwtVerify(ticket, ticketKey(), { algorithms: ["HS256"] });
    if (payload.purpose !== "events" || !payload.sub) throw new Error("bad ticket");
    return { id: payload.sub };
  } catch {
    throw new UnauthorizedError("Invalid events ticket.");
  }
}
