import { z } from "zod";

// Validated once at startup — the process refuses to boot on bad env (fail fast).
const Env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGINS: z.string().default("http://localhost:3000").transform((s) => s.split(",").map((o) => o.trim()).filter(Boolean)),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  SUPABASE_URL: z.string().optional(),
  SUPABASE_JWKS_URL: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(), // HS256 — local dev + self-hosted supabase

  R2_ENDPOINT: z.string().default("https://example.r2.cloudflarestorage.com"),
  R2_BUCKET: z.string().default("kivlo-dev"),
  R2_ACCESS_KEY_ID: z.string().default("dummy"),
  R2_SECRET_ACCESS_KEY: z.string().default("dummy"),
  R2_PUBLIC_BASE: z.string().default("http://localhost:8787/files"),

  // Local dev only: accepts `Authorization: Bearer dev` for the seeded demo user.
  // Refused in production.
  DEV_AUTH: z.coerce.boolean().default(false),
  DEV_USER_ID: z.string().default("00000000-0000-0000-0000-0000000000a1"),
});

const parsed = Env.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:");
  for (const i of parsed.error.issues) console.error(`  ${i.path.join(".")}: ${i.message}`);
  process.exit(1);
}

export const config = parsed.data;

if (config.NODE_ENV === "production" && config.DEV_AUTH) {
  console.error("Refusing to start: DEV_AUTH must not be enabled in production.");
  process.exit(1);
}
if (config.NODE_ENV === "production" && !config.SUPABASE_JWKS_URL && !config.SUPABASE_JWT_SECRET) {
  console.error("Refusing to start: production needs SUPABASE_JWKS_URL or SUPABASE_JWT_SECRET.");
  process.exit(1);
}
